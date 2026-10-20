import { supabase } from './supabase';

export type EventType = 'marathon' | 'training';

export type Event = {
  id: string;
  title: string;
  description: string | null;
  type: EventType;
  start_at: string;
  end_at: string | null;
  venue_name: string;
  venue_lat: number | null;
  venue_lng: number | null;
  poster_url: string | null;
  is_paid: boolean;
  entry_fee_ugx: number | null;
  distances_km: number[];
  capacity: number | null;
  results_published_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type RegistrationStatus =
  | 'pending'
  | 'paid'
  | 'confirmed'
  | 'cancelled'
  | 'refunded';

export type Registration = {
  id: string;
  event_id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  source: 'member' | 'guest' | 'admin';
  distance_km: number;
  status: RegistrationStatus;
  payment_id: string | null;
  bib: string | null;
  registered_at: string;
  updated_at: string;
};

export async function fetchEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Event[];
}

export async function fetchEventById(id: string): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Event;
}

export async function fetchMyRegistrations(): Promise<Registration[]> {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .order('registered_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Registration[];
}

export async function fetchRegistrationForEvent(
  eventId: string
): Promise<Registration | null> {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', eventId)
    .maybeSingle();

  if (error) throw error;
  return (data as Registration) ?? null;
}

export async function fetchRegistrationById(
  registrationId: string
): Promise<Registration | null> {
  const { data, error } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('id', registrationId)
    .maybeSingle();

  if (error) throw error;
  return (data as Registration) ?? null;
}

export async function fetchRegistrationCount(eventId: string): Promise<number> {
  const { data, error } = await supabase.rpc('event_registration_count', {
    event_id_input: eventId,
  });

  if (error) throw error;
  return (data as number) ?? 0;
}

export async function registerForEvent(
  eventId: string,
  authUserId: string,
  distanceKm: number
): Promise<Registration> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', authUserId)
    .single();

  if (profileError || !profile) {
    throw new Error('Could not find your profile.');
  }

  const { data, error } = await supabase
    .from('event_registrations')
    .insert({
      event_id: eventId,
      user_id: profile.id,
      distance_km: distanceKm,
      source: 'member',
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) {
    // 23505 = unique_violation — the user is already registered.
    // Fetch the existing row and return it instead of throwing.
    if ((error as any).code === '23505') {
      const { data: existing, error: fetchErr } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', profile.id)
        .maybeSingle();

      if (fetchErr || !existing) {
        throw new Error('You are already registered for this event.');
      }
      return existing as Registration;
    }
    throw error;
  }
  return data as Registration;
}

export async function cancelRegistration(registrationId: string): Promise<void> {
  const { error } = await supabase
    .from('event_registrations')
    .update({ status: 'cancelled' })
    .eq('id', registrationId);

  if (error) throw error;
}

export function formatDistance(km: number): string {
  return Number.isInteger(km) ? `${km}k` : `${km}km`;
}

export function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatEventTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFee(ugx: number | null, isPaid: boolean): string {
  if (!isPaid || ugx == null) return 'Free';
  return `UGX ${ugx.toLocaleString('en-UG')}`;
}