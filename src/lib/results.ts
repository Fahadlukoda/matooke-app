import { supabase } from './supabase';

export type Result = {
  id: string;
  event_id: string;
  user_id: string | null;
  bib: string | null;
  display_name: string;
  position: number | null;
  distance_km: number;
  duration_s: number;
  pace_s: number | null;
  gender: string | null;
  age_group: string | null;
  created_at: string;
};

export type PersonalBest = {
  distance_km: number;
  best_duration_s: number;
  source: 'run' | 'race';
  achieved_at: string;
};

export type LeaderboardRow = {
  profile_id: string;
  full_name: string;
  avatar_url: string | null;
  total_distance_m: number;
  run_count: number;
};

export type LeaderboardPeriod = 'month' | 'quarter' | 'year';

export async function fetchEventResults(eventId: string): Promise<Result[]> {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('event_id', eventId)
    .order('distance_km', { ascending: true })
    .order('position', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Result[];
}

export async function fetchMyPersonalBests(): Promise<PersonalBest[]> {
  const { data, error } = await supabase.rpc('my_personal_bests');
  if (error) throw error;
  return (data ?? []) as PersonalBest[];
}

export async function fetchLeaderboard(
  period: LeaderboardPeriod
): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.rpc('club_leaderboard', {
    period,
  });
  if (error) throw error;
  return ((data ?? []) as any[]).map((row) => ({
    profile_id: row.profile_id,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    total_distance_m: Number(row.total_distance_m),
    run_count: Number(row.run_count),
  }));
}

export function formatResultTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatPace(secondsPerKm: number | null): string {
  if (!secondsPerKm || secondsPerKm <= 0) return '—:—';
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.round(secondsPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatLeaderboardDistance(meters: number): string {
  const km = meters / 1000;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function ordinal(n: number | null): string {
  if (n == null) return '—';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]!);
}