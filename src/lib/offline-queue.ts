import AsyncStorage from '@react-native-async-storage/async-storage';

import { insertRun, type RunInsert, type Run } from './runs';
import { supabase } from './supabase';
import { useAuthStore } from '@/state/auth';
import { track } from './analytics';

const QUEUE_KEY = '@matooke/offline-runs-v1';

export type QueuedRun = {
  clientId: string;
  userId: string;
  payload: RunInsert;
  queuedAt: number;
  attempts: number;
  lastError?: string;
};

async function readQueue(): Promise<QueuedRun[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as QueuedRun[];
  } catch {
    return [];
  }
}

async function writeQueue(queue: QueuedRun[]): Promise<void> {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

async function getProfileIdForAuthUser(authUserId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', authUserId)
    .maybeSingle();
  if (error || !data) return null;
  return data.id;
}

export async function enqueueRun(input: {
  authUserId: string;
  payload: RunInsert;
}): Promise<void> {
  const queue = await readQueue();
  // client_id is unique — replace any prior entry rather than duplicating
  const filtered = queue.filter((q) => q.clientId !== input.payload.client_id);
  filtered.push({
    clientId: input.payload.client_id,
    userId: input.authUserId,
    payload: input.payload,
    queuedAt: Date.now(),
    attempts: 0,
  });
  await writeQueue(filtered);
}

export async function trySyncNow(input: {
  authUserId: string;
  payload: RunInsert;
}): Promise<{ synced: boolean; run?: Run; error?: string }> {
  const profileId = await getProfileIdForAuthUser(input.authUserId);
  if (!profileId) {
    return { synced: false, error: 'profile_not_found' };
  }

  try {
    const run = await insertRun(profileId, input.payload);
    return { synced: true, run };
  } catch (e) {
    return { synced: false, error: String(e) };
  }
}

export async function syncQueuedRuns(): Promise<{ synced: number; failed: number }> {
  const user = useAuthStore.getState().user;
  if (!user) return { synced: 0, failed: 0 };

  const queue = await readQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  const profileId = await getProfileIdForAuthUser(user.id);
  if (!profileId) return { synced: 0, failed: queue.length };

  const remaining: QueuedRun[] = [];
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    if (item.userId !== user.id) {
      // leave other users' queued runs alone
      remaining.push(item);
      continue;
    }

    try {
      await insertRun(profileId, item.payload);
      synced += 1;
    } catch (e) {
      failed += 1;
      track('run_sync_failed', {
        run_id: item.clientId,
        reason: String(e).slice(0, 200),
      });
      remaining.push({
        ...item,
        attempts: item.attempts + 1,
        lastError: String(e).slice(0, 200),
      });
    }
  }

  await writeQueue(remaining);
  return { synced, failed };
}

export async function getQueuedCount(): Promise<number> {
  const queue = await readQueue();
  return queue.length;
}