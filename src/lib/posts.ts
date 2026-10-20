import { supabase } from './supabase';
import type { GPSPoint } from './run-store';

export type PostType = 'run' | 'announcement' | 'result' | 'ad';

export type PostAuthor = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: 'member' | 'captain' | 'admin';
};

export type PostRun = {
  id: string;
  distance_m: number;
  duration_s: number;
  avg_pace_s: number | null;
  started_at: string;
  route: GPSPoint[] | null;
} | null;

export type PostEvent = {
  id: string;
  title: string;
  start_at: string;
  venue_name: string;
  type: 'marathon' | 'training';
} | null;

export type Post = {
  id: string;
  author_id: string;
  type: PostType;
  body: string | null;
  run_id: string | null;
  event_id: string | null;
  image_url: string | null;
  created_at: string;
  author: PostAuthor;
  run: PostRun;
  event: PostEvent;
  reaction_count: number;
  reacted_by_me: boolean;
};

type RawPost = {
  id: string;
  author_id: string;
  type: PostType;
  body: string | null;
  run_id: string | null;
  event_id: string | null;
  image_url: string | null;
  created_at: string;
  author: PostAuthor;
  run: PostRun;
  event: PostEvent;
  reactions: { user_id: string }[];
};

const POST_SELECT = `
  id,
  author_id,
  type,
  body,
  run_id,
  event_id,
  image_url,
  created_at,
  author:profiles!posts_author_id_fkey (
    id,
    full_name,
    avatar_url,
    role
  ),
  run:runs!posts_run_id_fkey (
    id,
    distance_m,
    duration_s,
    avg_pace_s,
    started_at,
    route
  ),
  event:events!posts_event_id_fkey (
    id,
    title,
    start_at,
    venue_name,
    type
  ),
  reactions (
    user_id
  )
`;

function hydrate(raw: RawPost, myProfileId: string | null): Post {
  const reactionCount = raw.reactions?.length ?? 0;
  const reactedByMe = myProfileId
    ? (raw.reactions ?? []).some((r) => r.user_id === myProfileId)
    : false;

  return {
    id: raw.id,
    author_id: raw.author_id,
    type: raw.type,
    body: raw.body,
    run_id: raw.run_id,
    event_id: raw.event_id,
    image_url: raw.image_url,
    created_at: raw.created_at,
    author: raw.author,
    run: raw.run,
    event: raw.event,
    reaction_count: reactionCount,
    reacted_by_me: reactedByMe,
  };
}

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

export async function uploadRunPostImage(
  userId: string,
  uri: string,
  mimeType?: string | null
): Promise<string> {
  const mime = mimeType && mimeType.length > 0 ? mimeType : 'image/jpeg';
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg';

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  const path = `posts/${userId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('player-photos')
    .upload(path, arrayBuffer, {
      contentType: mime,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('player-photos').getPublicUrl(path);
  return data.publicUrl;
}

export async function fetchFeed(): Promise<Post[]> {
  const myProfileId = await getMyProfileId();

  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return ((data ?? []) as unknown as RawPost[]).map((p) => hydrate(p, myProfileId));
}

export async function fetchPostById(postId: string): Promise<Post> {
  const myProfileId = await getMyProfileId();

  const { data, error } = await supabase
    .from('posts')
    .select(POST_SELECT)
    .eq('id', postId)
    .single();

  if (error) throw error;
  return hydrate(data as unknown as RawPost, myProfileId);
}

export async function createRunPost(input: {
  runId: string;
  body: string;
  imageUrl?: string | null;
}): Promise<Post> {
  const myProfileId = await getMyProfileId();
  if (!myProfileId) throw new Error('not_signed_in');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: myProfileId,
      type: 'run',
      run_id: input.runId,
      body: input.body.trim() || null,
      image_url: input.imageUrl ?? null,
    })
    .select(POST_SELECT)
    .single();

  if (error) throw error;
  return hydrate(data as unknown as RawPost, myProfileId);
}

export async function createAnnouncement(input: {
  body: string;
  imageUrl: string | null;
}): Promise<Post> {
  const myProfileId = await getMyProfileId();
  if (!myProfileId) throw new Error('not_signed_in');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: myProfileId,
      type: 'announcement',
      body: input.body.trim(),
      image_url: input.imageUrl,
    })
    .select(POST_SELECT)
    .single();

  if (error) throw error;
  return hydrate(data as unknown as RawPost, myProfileId);
}

export async function createAd(input: {
  body: string;
  imageUrl: string | null;
}): Promise<Post> {
  const myProfileId = await getMyProfileId();
  if (!myProfileId) throw new Error('not_signed_in');

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: myProfileId,
      type: 'ad',
      body: input.body.trim(),
      image_url: input.imageUrl,
    })
    .select(POST_SELECT)
    .single();

  if (error) throw error;
  return hydrate(data as unknown as RawPost, myProfileId);
}

export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('id', postId);
  if (error) throw error;
}

export async function toggleReaction(input: {
  postId: string;
  currentlyReacted: boolean;
}): Promise<void> {
  const myProfileId = await getMyProfileId();
  if (!myProfileId) throw new Error('not_signed_in');

  if (input.currentlyReacted) {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('post_id', input.postId)
      .eq('user_id', myProfileId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('reactions')
      .insert({
        post_id: input.postId,
        user_id: myProfileId,
        kind: 'cheer',
      });
    if (error) throw error;
  }
}