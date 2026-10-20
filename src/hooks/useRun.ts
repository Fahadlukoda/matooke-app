import { useCallback, useEffect, useRef } from 'react';
import {
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import {
  useRunStore,
  elapsedMs,
  type RunSnapshot,
  type RunStatus,
} from '@/lib/run-store';
import {
  startTracking,
  stopTracking,
  pauseTracking,
  resumeTracking,
  computeAvgPaceSecPerKm,
  computeCurrentPaceSecPerKm,
} from '@/lib/run-tracker';
import { useAuthStore } from '@/state/auth';

export type RunDerivedValues = {
  elapsedMsShared: SharedValue<number>;
  distanceMShared: SharedValue<number>;
  currentPaceShared: SharedValue<number>;
  avgPaceShared: SharedValue<number>;
  stepsShared: SharedValue<number>;
};

export function useRun(): {
  status: RunStatus;
  snapshot: RunSnapshot;
  derived: RunDerivedValues;
  startRun: (eventId: string | null) => Promise<void>;
  pauseRun: () => void;
  resumeRun: () => Promise<void>;
  finishRun: () => void;
  discardRun: () => void;
} {
  const status = useRunStore((s) => s.status);
  const snapshot = useRunStore((s) => s.snapshot);
  const storeStart = useRunStore((s) => s.start);
  const storePause = useRunStore((s) => s.pause);
  const storeResume = useRunStore((s) => s.resume);
  const storeFinish = useRunStore((s) => s.finish);
  const storeDiscard = useRunStore((s) => s.discard);

  const elapsedMsShared = useSharedValue(0);
  const distanceMShared = useSharedValue(0);
  const currentPaceShared = useSharedValue(0);
  const avgPaceShared = useSharedValue(0);
  const stepsShared = useSharedValue(0);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status !== 'running' && status !== 'paused') {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }

    tickRef.current = setInterval(() => {
      const snap = useRunStore.getState().snapshot;
      elapsedMsShared.value = elapsedMs(snap);
      distanceMShared.value = snap.distanceM;
      stepsShared.value = snap.steps;

      const current = computeCurrentPaceSecPerKm(snap.route);
      currentPaceShared.value = current ?? 0;

      const avg = computeAvgPaceSecPerKm(
        snap.distanceM,
        elapsedMs(snap)
      );
      avgPaceShared.value = avg ?? 0;
    }, 250);

    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [
    status,
    elapsedMsShared,
    distanceMShared,
    currentPaceShared,
    avgPaceShared,
    stepsShared,
  ]);

  const startRun = useCallback(
    async (eventId: string | null) => {
      storeStart({ eventId });
      const result = await startTracking();
      if (!result.started) {
        useRunStore.getState().discard();
      }
    },
    [storeStart]
  );

  const pauseRun = useCallback(() => {
    pauseTracking();
    storePause();
  }, [storePause]);

  const resumeRun = useCallback(async () => {
    storeResume();
    const result = await resumeTracking();
    if (!result.started) {
      // fail closed: keep the run paused if tracking can't restart
      useRunStore.getState().pause();
    }
  }, [storeResume]);

  const finishRun = useCallback(() => {
    stopTracking();
    storeFinish();
  }, [storeFinish]);

  const discardRun = useCallback(() => {
    stopTracking();
    storeDiscard();
  }, [storeDiscard]);

  return {
    status,
    snapshot,
    derived: {
      elapsedMsShared,
      distanceMShared,
      currentPaceShared,
      avgPaceShared,
      stepsShared,
    },
    startRun,
    pauseRun,
    resumeRun,
    finishRun,
    discardRun,
  };
}

export function useRunUserId(): string | null {
  const user = useAuthStore((s) => s.user);
  return user?.id ?? null;
}

export function formatPace(secPerKm: number): string {
  if (!secPerKm || secPerKm <= 0) return '—:—';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatDuration(ms: number): string {
  const totalS = Math.floor(ms / 1000);
  const h = Math.floor(totalS / 3600);
  const m = Math.floor((totalS % 3600) / 60);
  const s = totalS % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatDistanceKm(m: number): string {
  return (m / 1000).toFixed(2);
}