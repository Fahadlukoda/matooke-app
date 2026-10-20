import type { Event, Registration } from '@/lib/events';

export type EventRunState = 'registered' | 'open' | 'closed';

export function getEventRunState(
  event: Pick<Event, 'results_published_at'>,
  registration: Pick<Registration, 'status'> | null
): EventRunState {
  if (registration && registration.status !== 'cancelled') {
    return 'registered';
  }
  return event.results_published_at ? 'closed' : 'open';
}
