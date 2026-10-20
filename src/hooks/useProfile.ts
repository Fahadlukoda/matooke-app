import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/state/auth';
import {
  fetchProfile,
  updateProfile,
  type Profile,
  type ProfileUpdate,
} from '@/lib/profile';

export const profileKey = (userId: string) => ['profile', userId] as const;

export function useProfile() {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  return useQuery<Profile>({
    queryKey: userId ? profileKey(userId) : ['profile', 'anon'],
    queryFn: () => fetchProfile(userId!),
    enabled: Boolean(userId),
    staleTime: 1000 * 60,
  });
}

export function useUpdateProfile() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: ProfileUpdate) => {
      if (!user) throw new Error('Not signed in');
      return updateProfile(user.id, patch);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKey(data.user_id), data);
    },
  });
}

export async function signOut() {
  await supabase.auth.signOut();
}