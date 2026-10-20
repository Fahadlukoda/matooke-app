import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Platform } from 'react-native';

import { useRunStore, type GPSPoint } from './run-store';

const KEEP_AWAKE_TAG = 'matooke-run';
const MIN_MOVE_M = 1.5;
const MAX_ACCURACY_M = 50;
const PACE_WINDOW_MS = 10_000;

let locationSub: Location.LocationSubscription | null = null;
let pedometerSub: { remove: () => void } | null = null;
let lastPoint: GPSPoint | null = null;
let keepAwakeActive = false;

function haversineM(a: GPSPoint, b: GPSPoint): number {
  const R = 6371000;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const Δφ = ((b.lat - a.lat) * Math.PI) / 180;
  const Δλ = ((b.lng - a.lng) * Math.PI) / 180;
  const sinΔφ = Math.sin(Δφ / 2);
  const sinΔλ = Math.sin(Δλ / 2);
  const h = sinΔφ * sinΔφ + Math.cos(φ1) * Math.cos(φ2) * sinΔλ * sinΔλ;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

async function safelyActivateKeepAwake(): Promise<void> {
  try {
    await activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    keepAwakeActive = true;
  } catch {
    // Web wake lock requires a user gesture; native always succeeds.
    keepAwakeActive = false;
  }
}

function safelyDeactivateKeepAwake(): void {
  if (!keepAwakeActive) return;
  try {
    deactivateKeepAwake(KEEP_AWAKE_TAG);
  } catch {
    // ignore — the wake lock may not have activated on web
  }
  keepAwakeActive = false;
}

export async function startTracking(): Promise<{ started: boolean; reason?: string }> {
  const store = useRunStore.getState();
  if (store.status !== 'running') return { started: false, reason: 'not_running' };

  lastPoint = null;

  try {
    locationSub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 3,
        timeInterval: 1000,
        mayShowUserSettingsDialog: true,
      },
      (loc) => {
        const accuracy = loc.coords.accuracy ?? null;
        if (accuracy != null && accuracy > MAX_ACCURACY_M) return;

        const point: GPSPoint = {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          t: loc.timestamp,
          accuracy,
        };

        let incremental = 0;
        if (lastPoint) {
          const d = haversineM(lastPoint, point);
          if (d >= MIN_MOVE_M) {
            incremental = d;
          }
        }
        lastPoint = point;
        useRunStore.getState().appendPoint(point, incremental);
      }
    );
  } catch (e) {
    return { started: false, reason: String(e) };
  }

  try {
    const available = await Pedometer.isAvailableAsync();
    if (available) {
      pedometerSub = Pedometer.watchStepCount((result) => {
        useRunStore.getState().setSteps(result.steps);
      });
    }
  } catch {
    // steps are optional; failure here does not stop the run
  }

  await safelyActivateKeepAwake();

  return { started: true };
}

export function stopTracking(): void {
  if (locationSub) {
    locationSub.remove();
    locationSub = null;
  }
  if (pedometerSub) {
    pedometerSub.remove();
    pedometerSub = null;
  }
  lastPoint = null;
  safelyDeactivateKeepAwake();
}

export function pauseTracking(): void {
  if (locationSub) {
    locationSub.remove();
    locationSub = null;
  }
  if (pedometerSub) {
    pedometerSub.remove();
    pedometerSub = null;
  }
  safelyDeactivateKeepAwake();
}

export async function resumeTracking(): Promise<{ started: boolean; reason?: string }> {
  lastPoint = null;
  return startTracking();
}

export function computeCurrentPaceSecPerKm(route: GPSPoint[]): number | null {
  if (route.length < 2) return null;
  const now = route[route.length - 1]!.t;
  const cutoff = now - PACE_WINDOW_MS;

  const window = route.filter((p) => p.t >= cutoff);
  if (window.length < 2) return null;

  let dist = 0;
  for (let i = 1; i < window.length; i++) {
    dist += haversineM(window[i - 1]!, window[i]!);
  }
  const durationS = (window[window.length - 1]!.t - window[0]!.t) / 1000;
  if (dist < 5 || durationS <= 0) return null;

  return Math.round((durationS * 1000) / dist);
}

export function computeAvgPaceSecPerKm(distanceM: number, durationMs: number): number | null {
  if (distanceM < 50 || durationMs <= 0) return null;
  return Math.round((durationMs / 1000 / distanceM) * 1000);
}

export function computeCaloriesEstimate(
  distanceM: number,
  durationMs: number,
  weightKg: number = 70
): number {
  const MET = 9.8;
  const hours = durationMs / 3_600_000;
  return Math.round(MET * weightKg * hours);
}