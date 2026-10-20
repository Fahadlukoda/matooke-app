import { supabase } from './supabase';
import type { GPSPoint } from './run-store';

export type Run = {
  id: string;
  user_id: string;
  event_id: string | null;
  client_id: string;
  started_at: string;
  ended_at: string;
  distance_m: number;
  duration_s: number;
  avg_pace_s: number | null;
  steps: number | null;
  calories: number | null;
  route: GPSPoint[] | null;
  visibility: 'private' | 'club';
  created_at: string;
};

export type RunInsert = {
  client_id: string;
  event_id: string | null;
  started_at: string;
  ended_at: string;
  distance_m: number;
  duration_s: number;
  avg_pace_s: number | null;
  steps: number | null;
  calories: number | null;
  route: GPSPoint[];
  visibility: 'private' | 'club';
};

export async function insertRun(profileId: string, input: RunInsert): Promise<Run> {
  const { data, error } = await supabase
    .from('runs')
    .insert({
      user_id: profileId,
      ...input,
    })
    .select('*')
    .single();

  if (error) {
    // 23505 = unique_violation on client_id — already synced
    if ((error as any).code === '23505') {
      const existing = await fetchRunByClientId(input.client_id);
      if (existing) return existing;
    }
    throw error;
  }
  return data as Run;
}

export async function fetchRunByClientId(clientId: string): Promise<Run | null> {
  const { data, error } = await supabase
    .from('runs')
    .select('*')
    .eq('client_id', clientId)
    .maybeSingle();

  if (error) throw error;
  return (data as Run) ?? null;
}

export async function fetchMyRuns(): Promise<Run[]> {
  const { data, error } = await supabase
    .from('runs')
    .select('*')
    .order('started_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Run[];
}

export async function fetchRunById(runId: string): Promise<Run> {
  const { data, error } = await supabase
    .from('runs')
    .select('*')
    .eq('id', runId)
    .single();

  if (error) throw error;
  return data as Run;
}

export async function updateRunVisibility(
  runId: string,
  visibility: 'private' | 'club'
): Promise<void> {
  const { error } = await supabase
    .from('runs')
    .update({ visibility })
    .eq('id', runId);

  if (error) throw error;
}

export async function deleteRun(runId: string): Promise<void> {
  const { error } = await supabase.from('runs').delete().eq('id', runId);
  if (error) throw error;
}