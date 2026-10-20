import * as Location from 'expo-location';
import { Pedometer } from 'expo-sensors';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export type RunPermissions = {
  foregroundLocation: PermissionStatus;
  backgroundLocation: PermissionStatus;
  motion: PermissionStatus;
  canTrack: boolean;
  canCountSteps: boolean;
};

export async function checkRunPermissions(): Promise<RunPermissions> {
  const fg = await Location.getForegroundPermissionsAsync();
  const bg = await Location.getBackgroundPermissionsAsync();

  let motion: PermissionStatus = 'undetermined';
  try {
    const available = await Pedometer.isAvailableAsync();
    if (available) {
      const perm = await Pedometer.getPermissionsAsync();
      motion = perm.status as PermissionStatus;
    } else {
      motion = 'denied';
    }
  } catch {
    motion = 'denied';
  }

  const foregroundLocation = fg.status as PermissionStatus;
  const backgroundLocation = bg.status as PermissionStatus;

  return {
    foregroundLocation,
    backgroundLocation,
    motion,
    canTrack: foregroundLocation === 'granted',
    canCountSteps: motion === 'granted',
  };
}

export async function requestRunPermissions(): Promise<RunPermissions> {
  const fg = await Location.requestForegroundPermissionsAsync();

  let bg = await Location.getBackgroundPermissionsAsync();
  if (fg.status === 'granted' && bg.status !== 'granted') {
    bg = await Location.requestBackgroundPermissionsAsync();
  }

  let motion: PermissionStatus = 'undetermined';
  try {
    const available = await Pedometer.isAvailableAsync();
    if (available) {
      const perm = await Pedometer.requestPermissionsAsync();
      motion = perm.status as PermissionStatus;
    } else {
      motion = 'denied';
    }
  } catch {
    motion = 'denied';
  }

  const foregroundLocation = fg.status as PermissionStatus;
  const backgroundLocation = bg.status as PermissionStatus;

  return {
    foregroundLocation,
    backgroundLocation,
    motion,
    canTrack: foregroundLocation === 'granted',
    canCountSteps: motion === 'granted',
  };
}