type EventProperties = {
  signup_started: { method: 'email' };
  signup_completed: { user_id: string };
  onboarding_step_completed: { step: 'identity' | 'location_level' | 'safety' | 'done' };
  onboarding_completed: { user_id: string };
  signin_success: { user_id: string };
  signin_failed: { reason: string };

  event_viewed: { event_id: string; type: 'marathon' | 'training' };
  registration_started: { event_id: string; distance_km: number };
  registration_completed: { event_id: string; distance_km: number; is_paid: boolean };
  registration_cancelled: { event_id: string; distance_km: number };

  checkout_started: { event_id: string; amount_ugx: number };
  payment_method_selected: { method: 'mtn_momo' | 'airtel_money' };
  payment_succeeded: { event_id: string; amount_ugx: number };
  payment_failed: { event_id: string; reason: string };

  run_started: { event_id: string | null };
  run_paused: Record<string, never>;
  run_resumed: Record<string, never>;
  run_finished: { distance_m: number; duration_s: number };
  run_saved: { run_id: string; visibility: 'private' | 'club' };
  run_discarded: { distance_m: number };
  run_sync_failed: { run_id: string; reason: string };

  post_created: { type: 'run' | 'announcement' | 'result'; post_id: string };
  reaction_added: { post_id: string; kind: 'cheer' };

  results_viewed: { event_id: string };
  pb_achieved: { distance_km: 5 | 10 | 21 | 42 };

  notification_received: { type: string };
  notification_opened: { type: string };

  app_opened: Record<string, never>;
  screen_viewed: { screen: string };
};

type EventName = keyof EventProperties;

const distinctIdHolder: { current: string | null } = { current: null };

export function identify(userId: string): void {
  distinctIdHolder.current = userId;
}

export function reset(): void {
  distinctIdHolder.current = null;
}

export function track<E extends EventName>(
  event: E,
  properties: EventProperties[E]
): void {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('[analytics]', event, properties, distinctIdHolder.current);
  }
}