import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchAdminCounts,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventPoster,
  markRegistrationPaid,
  confirmRegistration,
  assignBib,
  adminCancelRegistration,
  publishResults,
  uploadResults,
  updateMemberRole,
  createAnnouncement,
  type AdminCounts,
  type CreateEventInput,
  type ResultRowInput,
} from '@/lib/admin';
import { eventsKey } from './useEvents';
import { feedKey } from './usePosts';

export const adminCountsKey = ['admin', 'counts'] as const;

export function useAdminCounts() {
  return useQuery<AdminCounts>({
    queryKey: adminCountsKey,
    queryFn: fetchAdminCounts,
    staleTime: 1000 * 60,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKey });
      queryClient.invalidateQueries({ queryKey: adminCountsKey });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { eventId: string; patch: Partial<CreateEventInput> }) =>
      updateEvent(input.eventId, input.patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKey });
      queryClient.invalidateQueries({ queryKey: adminCountsKey });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKey });
      queryClient.invalidateQueries({ queryKey: adminCountsKey });
    },
  });
}

export function useUploadEventPoster() {
  return useMutation({
    mutationFn: (file: { uri: string; mimeType?: string | null }) =>
      uploadEventPoster(file),
  });
}

export function useMarkRegistrationPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registrationId: string) => markRegistrationPaid(registrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations', 'event'] });
      queryClient.invalidateQueries({ queryKey: adminCountsKey });
    },
  });
}

export function useConfirmRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registrationId: string) => confirmRegistration(registrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations', 'event'] });
    },
  });
}

export function useAssignBib() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { registrationId: string; bib: string }) =>
      assignBib(input.registrationId, input.bib),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations', 'event'] });
    },
  });
}

export function useAdminCancelRegistration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registrationId: string) => adminCancelRegistration(registrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations', 'event'] });
      queryClient.invalidateQueries({ queryKey: adminCountsKey });
    },
  });
}

export function usePublishResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => publishResults(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsKey });
      queryClient.invalidateQueries({ queryKey: adminCountsKey });
    },
  });
}

export function useUploadResults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { eventId: string; rows: ResultRowInput[] }) =>
      uploadResults(input.eventId, input.rows),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['results', 'event', variables.eventId],
      });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { profileId: string; role: 'member' | 'captain' | 'admin' }) =>
      updateMemberRole(input.profileId, input.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'members'] });
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
      queryClient.invalidateQueries({ queryKey: adminCountsKey });
    },
  });
}