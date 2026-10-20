import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchFeed,
  fetchPostById,
  createRunPost,
  createAnnouncement,
  createAd,
  deletePost,
  toggleReaction,
  type Post,
} from '@/lib/posts';

export const feedKey = ['feed'] as const;
export const postKey = (id: string) => ['post', id] as const;

export function useFeed() {
  return useQuery<Post[]>({
    queryKey: feedKey,
    queryFn: fetchFeed,
    staleTime: 1000 * 30,
  });
}

export function usePost(postId: string | undefined) {
  return useQuery<Post>({
    queryKey: postId ? postKey(postId) : ['post', 'none'],
    queryFn: () => fetchPostById(postId!),
    enabled: Boolean(postId),
    staleTime: 1000 * 30,
  });
}

export function useCreateRunPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { runId: string; body: string; imageUrl?: string | null }) =>
      createRunPost(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKey });
    },
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { body: string; imageUrl: string | null }) =>
      createAnnouncement(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKey });
    },
  });
}

export function useCreateAd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { body: string; imageUrl: string | null }) =>
      createAd(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKey });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: (_data, postId) => {
      queryClient.removeQueries({ queryKey: postKey(postId) });
      queryClient.invalidateQueries({ queryKey: feedKey });
    },
  });
}

export function useToggleReaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { postId: string; currentlyReacted: boolean }) =>
      toggleReaction(input),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: feedKey });
      await queryClient.cancelQueries({
        queryKey: postKey(variables.postId),
      });

      const previousFeed = queryClient.getQueryData<Post[]>(feedKey);
      const previousPost = queryClient.getQueryData<Post>(
        postKey(variables.postId)
      );

      const flip = (p: Post): Post =>
        p.id === variables.postId
          ? {
              ...p,
              reacted_by_me: !p.reacted_by_me,
              reaction_count: p.reacted_by_me
                ? Math.max(0, p.reaction_count - 1)
                : p.reaction_count + 1,
            }
          : p;

      if (previousFeed) {
        queryClient.setQueryData<Post[]>(feedKey, previousFeed.map(flip));
      }
      if (previousPost) {
        queryClient.setQueryData<Post>(postKey(variables.postId), flip(previousPost));
      }

      return { previousFeed, previousPost };
    },
    onError: (_err, variables, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(feedKey, context.previousFeed);
      }
      if (context?.previousPost) {
        queryClient.setQueryData(
          postKey(variables.postId),
          context.previousPost
        );
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: feedKey });
      queryClient.invalidateQueries({ queryKey: postKey(variables.postId) });
    },
  });
}