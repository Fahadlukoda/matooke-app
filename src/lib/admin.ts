import { supabase } from './supabase';
import type { Event, EventType } from './events';

export type CreateEventInput = {
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
};

export type ResultRowInput = {
  display_name: string;
  bib: string | null;
  position: number | null;
  distance_km: number;
  duration_s: number;
  pace_s: number | null;
  gender: string | null;
  age_group: string | null;
  user_id: string | null;
};

export type ParsedResultRow = ResultRowInput & {
  raw: string;
  errors: string[];
};

export type AdminCounts = {
  upcomingEvents: number;
  pendingRegistrations: number;
  unpublishedResults: number;
  totalMembers: number;
};

async function getMyProfileId(): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  return data?.id ?? null;
}

export async function fetchAdminCounts(): Promise<AdminCounts> {
  const nowIso = new Date().toISOString();

  const [eventsRes, pendingRes, unpublishedRes, membersRes] = await Promise.all([
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .gte('start_at', nowIso),
    supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .lt('start_at', nowIso)
      .is('results_published_at', null),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .is('deleted_at', null),
  ]);

  return {
    upcomingEvents: eventsRes.count ?? 0,
    pendingRegistrations: pendingRes.count ?? 0,
    unpublishedResults: unpublishedRes.count ?? 0,
    totalMembers: membersRes.count ?? 0,
  };
}

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const myProfileId = await getMyProfileId();
  if (!myProfileId) throw new Error('not_signed_in');

  const { data, error } = await supabase
    .from('events')
    .insert({
      ...input,
      created_by: myProfileId,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Event;
}

export async function updateEvent(
  eventId: string,
  input: Partial<CreateEventInput>
): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .update(input)
    .eq('id', eventId)
    .select('*')
    .single();

  if (error) throw error;
  return data as Event;
}

export async function deleteEvent(eventId: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', eventId);
  if (error) throw error;
}

export async function uploadEventPoster(
  file: { uri: string; mimeType?: string | null }
): Promise<string> {
  const mime = file.mimeType || 'image/jpeg';
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';

  const response = await fetch(file.uri);
  const arrayBuffer = await response.arrayBuffer();

  const path = `posters/poster-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('event-posters')
    .upload(path, arrayBuffer, {
      contentType: mime,
      upsert: false,
      cacheControl: '3600',
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('event-posters').getPublicUrl(path);
  return data.publicUrl;
}

export async function markRegistrationPaid(registrationId: string): Promise<void> {
  const { error } = await supabase
    .from('event_registrations')
    .update({ status: 'paid' })
    .eq('id', registrationId);
  if (error) throw error;
}

export async function confirmRegistration(registrationId: string): Promise<void> {
  const { error } = await supabase
    .from('event_registrations')
    .update({ status: 'confirmed' })
    .eq('id', registrationId);
  if (error) throw error;
}

export async function assignBib(
  registrationId: string,
  bib: string
): Promise<void> {
  const { error } = await supabase
    .from('event_registrations')
    .update({ bib: bib.trim() })
    .eq('id', registrationId);
  if (error) throw error;
}

export async function adminCancelRegistration(
  registrationId: string
): Promise<void> {
  const { error } = await supabase
    .from('event_registrations')
    .update({ status: 'cancelled' })
    .eq('id', registrationId);
  if (error) throw error;
}

export async function publishResults(eventId: string): Promise<void> {
  const { error } = await supabase
    .from('events')
    .update({ results_published_at: new Date().toISOString() })
    .eq('id', eventId);
  if (error) throw error;
}

export async function uploadResults(
  eventId: string,
  rows: ResultRowInput[]
): Promise<number> {
  if (rows.length === 0) return 0;

  const payload = rows.map((r) => ({
    event_id: eventId,
    user_id: r.user_id,
    bib: r.bib,
    display_name: r.display_name,
    position: r.position,
    distance_km: r.distance_km,
    duration_s: r.duration_s,
    pace_s: r.pace_s,
    gender: r.gender,
    age_group: r.age_group,
  }));

  const { data, error } = await supabase
    .from('results')
    .insert(payload)
    .select('id');

  if (error) throw error;
  return data?.length ?? 0;
}

export async function updateMemberRole(
  profileId: string,
  role: 'member' | 'captain' | 'admin'
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role })
    .eq('id', profileId);
  if (error) throw error;
}

export async function createAnnouncement(input: {
  body: string;
  imageUrl: string | null;
}): Promise<void> {
  const myProfileId = await getMyProfileId();
  if (!myProfileId) throw new Error('not_signed_in');

  const { error } = await supabase.from('posts').insert({
    author_id: myProfileId,
    type: 'announcement',
    body: input.body.trim(),
    image_url: input.imageUrl,
  });

  if (error) throw error;
}

// ── CSV parsing for results ──

export function parseResultsCSV(input: string): ParsedResultRow[] {
  const lines = input
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  // Skip a header line if the first row looks like one
  const first = lines[0]!.toLowerCase();
  const hasHeader =
    first.includes('name') ||
    first.includes('bib') ||
    first.includes('position') ||
    first.includes('time');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((raw) => {
    const errors: string[] = [];
    const parts = raw.split(',').map((p) => p.trim());

    // Expected column order:
    // display_name, bib, position, distance_km, time, gender, age_group
    const [
      display_name,
      bib,
      positionStr,
      distanceStr,
      timeStr,
      gender,
      age_group,
    ] = parts;

    if (!display_name) errors.push('Missing name');

    const distance_km = parseFloat(distanceStr ?? '');
    if (!Number.isFinite(distance_km) || distance_km <= 0) {
      errors.push('Invalid distance');
    }

    const duration_s = parseTimeToSeconds(timeStr ?? '');
    if (duration_s == null) errors.push('Invalid time');

    const position = positionStr ? parseInt(positionStr, 10) : null;
    const pace_s =
      duration_s != null && Number.isFinite(distance_km) && distance_km > 0
        ? Math.round(duration_s / distance_km)
        : null;

    return {
      display_name: display_name ?? '',
      bib: bib?.trim() || null,
      position: position != null && Number.isFinite(position) ? position : null,
      distance_km: Number.isFinite(distance_km) ? distance_km : 0,
      duration_s: duration_s ?? 0,
      pace_s,
      gender: gender?.trim().toLowerCase() || null,
      age_group: age_group?.trim() || null,
      user_id: null,
      raw,
      errors,
    };
  });
}

function parseTimeToSeconds(input: string): number | null {
  const t = input.trim();
  if (!t) return null;

  // H:MM:SS or MM:SS or SS
  const parts = t.split(':').map((p) => p.trim());
  if (parts.length === 1) {
    const s = parseInt(parts[0]!, 10);
    return Number.isFinite(s) && s > 0 ? s : null;
  }
  if (parts.length === 2) {
    const m = parseInt(parts[0]!, 10);
    const s = parseInt(parts[1]!, 10);
    if (!Number.isFinite(m) || !Number.isFinite(s)) return null;
    return m * 60 + s;
  }
  if (parts.length === 3) {
    const h = parseInt(parts[0]!, 10);
    const m = parseInt(parts[1]!, 10);
    const s = parseInt(parts[2]!, 10);
    if (!Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(s)) return null;
    return h * 3600 + m * 60 + s;
  }
  return null;
}