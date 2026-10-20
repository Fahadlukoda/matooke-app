import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AppState } from 'react-native';

import {
  fetchMyRuns,
  fetchRunById,
  updateRunVisibility,
  deleteRun,
  type Run,
} from '@/lib/runs';
import { syncQueuedRuns } from '@/lib/offline-queue';

export const myRunsKey = ['runs', 'me'] as const;
export const runKey = (id: string) => ['runs', id] as const;

export function useMyRuns() {
  return useQuery<Run[]>({
    queryKey: myRunsKey,
    queryFn: fetchMyRuns,
    staleTime: 1000 * 60,
  });
}

export function useRunById(runId: string | undefined) {
  return useQuery<Run>({
    queryKey: runId ? runKey(runId) : ['runs', 'none'],
    queryFn: () => fetchRunById(runId!),
    enabled: Boolean(runId),
    staleTime: 1000 * 60,
  });
}

export function useUpdateRunVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ runId, visibility }: { runId: string; visibility: 'private' | 'club' }) =>
      updateRunVisibility(runId, visibility),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: myRunsKey });
      queryClient.invalidateQueries({ queryKey: runKey(variables.runId) });
    },
  });
}

export function useDeleteRun() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (runId: string) => deleteRun(runId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myRunsKey });
    },
  });
}

export function useOfflineSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;

    async function flush() {
      const result = await syncQueuedRuns();
      if (mounted && result.synced > 0) {
        queryClient.invalidateQueries({ queryKey: myRunsKey });
      }
    }

    flush();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') flush();
    });

    const interval = setInterval(flush, 60_000);

    return () => {
      mounted = false;
      sub.remove();
      clearInterval(interval);
    };
  }, [queryClient]);
}