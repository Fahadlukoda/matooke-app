import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/state/auth';

export type WeeklyPerformance = {
  week: string;
  maxDistanceM: number;
};

async function fetchWeeklyPerformance(
  userId: string
): Promise<WeeklyPerformance[]> {
  const currentWeekStart = new Date();
  currentWeekStart.setUTCHours(0, 0, 0, 0);
  const day = currentWeekStart.getUTCDay();
  currentWeekStart.setUTCDate(
    currentWeekStart.getUTCDate() - (day === 0 ? 6 : day - 1)
  );

  const firstWeekStart = new Date(currentWeekStart);
  firstWeekStart.setUTCDate(firstWeekStart.getUTCDate() - 7 * 7);

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) return [];

  const { data, error } = await supabase
    .from('runs')
    .select('distance_m, started_at')
    .eq('user_id', profile.id)
    .gte('started_at', firstWeekStart.toISOString())
    .order('started_at', { ascending: true });

  if (error) throw error;

  const byWeek = new Map<string, number>();
  for (const run of data ?? []) {
    const startedAt = new Date(run.started_at);
    const runWeekStart = new Date(startedAt);
    runWeekStart.setUTCHours(0, 0, 0, 0);
    const runDay = runWeekStart.getUTCDay();
    runWeekStart.setUTCDate(
      runWeekStart.getUTCDate() - (runDay === 0 ? 6 : runDay - 1)
    );
    const key = runWeekStart.toISOString().slice(0, 10);
    byWeek.set(key, Math.max(byWeek.get(key) ?? 0, run.distance_m));
  }

  return Array.from({ length: 8 }, (_, index) => {
    const weekStart = new Date(firstWeekStart);
    weekStart.setUTCDate(firstWeekStart.getUTCDate() + index * 7);
    const week = weekStart.toISOString().slice(0, 10);
    return {
      week,
      maxDistanceM: byWeek.get(week) ?? 0,
    };
  });
}

export function useWeeklyPerformance() {
  const user = useAuthStore((state) => state.user);
  return useQuery<WeeklyPerformance[]>({
    queryKey: ['weekly-performance', user?.id],
    queryFn: () => fetchWeeklyPerformance(user!.id),
    enabled: Boolean(user),
    staleTime: 1000 * 60 * 5,
  });
}
