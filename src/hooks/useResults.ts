import { useQuery } from '@tanstack/react-query';

import {
  fetchEventResults,
  fetchMyPersonalBests,
  fetchLeaderboard,
  type Result,
  type PersonalBest,
  type LeaderboardRow,
  type LeaderboardPeriod,
} from '@/lib/results';

export const myBestsKey = ['results', 'my-bests'] as const;
export const eventResultsKey = (eventId: string) =>
  ['results', 'event', eventId] as const;
export const leaderboardKey = (period: LeaderboardPeriod) =>
  ['leaderboard', period] as const;

export function useMyPersonalBests() {
  return useQuery<PersonalBest[]>({
    queryKey: myBestsKey,
    queryFn: fetchMyPersonalBests,
    staleTime: 1000 * 60 * 5,
  });
}

export function useEventResults(eventId: string | undefined) {
  return useQuery<Result[]>({
    queryKey: eventId ? eventResultsKey(eventId) : ['results', 'event', 'none'],
    queryFn: () => fetchEventResults(eventId!),
    enabled: Boolean(eventId),
    staleTime: 1000 * 60 * 5,
  });
}

export function useLeaderboard(period: LeaderboardPeriod) {
  return useQuery<LeaderboardRow[]>({
    queryKey: leaderboardKey(period),
    queryFn: () => fetchLeaderboard(period),
    staleTime: 1000 * 60,
  });
}