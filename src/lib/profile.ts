import { supabase } from './supabase';

export type Profile = {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  birthdate: string | null;
  gender: 'female' | 'male' | 'other' | 'prefer_not_to_say' | null;
  city: string | null;
  level: 'beginner' | 'intermediate' | 'advanced' | null;
  emergency_name: string | null;
  emergency_phone: string | null;
  medical_notes: string | null;
  role: 'member' | 'captain' | 'admin';
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ProfileUpdate = Partial<
  Pick<
    Profile,
    | 'full_name'
    | 'avatar_url'
    | 'birthdate'
    | 'gender'
    | 'city'
    | 'level'
    | 'emergency_name'
    | 'emergency_phone'
    | 'medical_notes'
    | 'onboarded_at'
  >
>;

export type PickedImage = {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
};

export async function fetchProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .single();

  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  patch: ProfileUpdate
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw error;
  return data as Profile;
}

function guessMimeFromUri(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic')) return 'image/heic';
  if (lower.endsWith('.heif')) return 'image/heif';
  return 'image/jpeg';
}

function extFromMime(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/heic') return 'heic';
  if (mime === 'image/heif') return 'heif';
  return 'jpg';
}

export async function uploadAvatar(
  userId: string,
  image: PickedImage
): Promise<string> {
  const mime = image.mimeType ?? guessMimeFromUri(image.uri);
  const ext = extFromMime(mime);

  const response = await fetch(image.uri);
  const arrayBuffer = await response.arrayBuffer();

  const path = `${userId}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('player-photos')
    .upload(path, arrayBuffer, {
      contentType: mime,
      upsert: true,
      cacheControl: '3600',
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('player-photos').getPublicUrl(path);
  return data.publicUrl;
}

export function computeBirthdateISO(
  day: string,
  month: string,
  year: string
): string | null {
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (!d || !m || !y) return null;
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > 31) return null;
  if (y < 1900 || y > new Date().getFullYear()) return null;

  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;

  return date.toISOString().slice(0, 10);
}