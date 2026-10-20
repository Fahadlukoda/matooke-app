import { create } from 'zustand';

export type RunStatus = 'idle' | 'ready' | 'running' | 'paused' | 'finished';

export type GPSPoint = {
  lat: number;
  lng: number;
  t: number;
  accuracy: number | null;
};

export type RunSnapshot = {
  id: string | null;
  clientId: string;
  eventId: string | null;
  startedAt: number | null;
  endedAt: number | null;
  pausedTotalMs: number;
  pauseStartedAt: number | null;
  distanceM: number;
  steps: number;
  route: GPSPoint[];
};

type RunState = {
  status: RunStatus;
  snapshot: RunSnapshot;

  start: (opts: { eventId: string | null }) => void;
  pause: () => void;
  resume: () => void;
  finish: () => void;
  discard: () => void;

  appendPoint: (point: GPSPoint, incrementalDistanceM: number) => void;
  setSteps: (steps: number) => void;
  setSavedRunId: (id: string) => void;
};

function newClientId(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const emptySnapshot = (): RunSnapshot => ({
  id: null,
  clientId: '',
  eventId: null,
  startedAt: null,
  endedAt: null,
  pausedTotalMs: 0,
  pauseStartedAt: null,
  distanceM: 0,
  steps: 0,
  route: [],
});

export const useRunStore = create<RunState>((set, get) => ({
  status: 'idle',
  snapshot: emptySnapshot(),

  start: ({ eventId }) =>
    set({
      status: 'running',
      snapshot: {
        ...emptySnapshot(),
        clientId: newClientId(),
        eventId,
        startedAt: Date.now(),
      },
    }),

  pause: () => {
    const { status } = get();
    if (status !== 'running') return;
    set((s) => ({
      status: 'paused',
      snapshot: { ...s.snapshot, pauseStartedAt: Date.now() },
    }));
  },

  resume: () => {
    const { status, snapshot } = get();
    if (status !== 'paused' || snapshot.pauseStartedAt == null) return;
    const pausedFor = Date.now() - snapshot.pauseStartedAt;
    set((s) => ({
      status: 'running',
      snapshot: {
        ...s.snapshot,
        pausedTotalMs: s.snapshot.pausedTotalMs + pausedFor,
        pauseStartedAt: null,
      },
    }));
  },

  finish: () => {
    const { status } = get();
    if (status !== 'running' && status !== 'paused') return;

    const now = Date.now();
    set((s) => {
      const snap = s.snapshot;
      let pausedTotalMs = snap.pausedTotalMs;
      if (s.status === 'paused' && snap.pauseStartedAt != null) {
        pausedTotalMs += now - snap.pauseStartedAt;
      }
      return {
        status: 'finished',
        snapshot: {
          ...snap,
          endedAt: now,
          pausedTotalMs,
          pauseStartedAt: null,
        },
      };
    });
  },

  discard: () => set({ status: 'idle', snapshot: emptySnapshot() }),

  appendPoint: (point, incrementalDistanceM) =>
    set((s) => {
      if (s.status !== 'running') return s;
      return {
        snapshot: {
          ...s.snapshot,
          distanceM: s.snapshot.distanceM + Math.max(0, incrementalDistanceM),
          route: [...s.snapshot.route, point],
        },
      };
    }),

  setSteps: (steps) =>
    set((s) => ({
      snapshot: { ...s.snapshot, steps },
    })),

  setSavedRunId: (id) =>
    set((s) => ({
      snapshot: { ...s.snapshot, id },
    })),
}));

export function elapsedMs(snapshot: RunSnapshot, now: number = Date.now()): number {
  if (snapshot.startedAt == null) return 0;
  const end = snapshot.endedAt ?? now;
  const pausedSoFar =
    snapshot.pausedTotalMs +
    (snapshot.pauseStartedAt != null ? now - snapshot.pauseStartedAt : 0);
  return Math.max(0, end - snapshot.startedAt - pausedSoFar);
}