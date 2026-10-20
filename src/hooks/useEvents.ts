import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  fetchEvents,
  fetchEventById,
  fetchMyRegistrations,
  fetchRegistrationForEvent,
  fetchRegistrationById,
  fetchRegistrationCount,
  registerForEvent,
  cancelRegistration,
  type Event,
  type Registration,
} from '@/lib/events';

export const eventsKey = ['events'] as const;
export const eventKey = (id: string) => ['events', id] as const;
export const myRegistrationsKey = ['registrations', 'me'] as const;
export const eventRegistrationKey = (eventId: string) =>
  ['registrations', 'event', eventId] as const;
export const registrationByIdKey = (registrationId: string) =>
  ['registrations', 'byId', registrationId] as const;
export const eventCountKey = (eventId: string) =>
  ['registrations', 'count', eventId] as const;

export function useEvents() {
  return useQuery<Event[]>({
    queryKey: eventsKey,
    queryFn: fetchEvents,
    staleTime: 1000 * 60 * 5,
  });
}

export function useEvent(id: string | undefined) {
  return useQuery<Event>({
    queryKey: id ? eventKey(id) : ['events', 'none'],
    queryFn: () => fetchEventById(id!),
    enabled: Boolean(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useMyRegistrations() {
  return useQuery<Registration[]>({
    queryKey: myRegistrationsKey,
    queryFn: fetchMyRegistrations,
    staleTime: 1000 * 60,
  });
}

export function useRegistrationForEvent(eventId: string | undefined) {
  return useQuery<Registration | null>({
    queryKey: eventId ? eventRegistrationKey(eventId) : ['registrations', 'none'],
    queryFn: () => fetchRegistrationForEvent(eventId!),
    enabled: Boolean(eventId),
    staleTime: 1000 * 30,
  });
}

export function useRegistrationById(registrationId: string | undefined) {
  return useQuery<Registration | null>({
    queryKey: registrationId
      ? registrationByIdKey(registrationId)
      : ['registrations', 'byId', 'none'],
    queryFn: () => fetchRegistrationById(registrationId!),
    enabled: Boolean(registrationId),
    staleTime: 1000 * 30,
  });
}

export function useRegistrationCount(eventId: string | undefined) {
  return useQuery<number>({
    queryKey: eventId ? eventCountKey(eventId) : ['registrations', 'count', 'none'],
    queryFn: () => fetchRegistrationCount(eventId!),
    enabled: Boolean(eventId),
    staleTime: 1000 * 60,
  });
}

export function useRegisterForEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      userId,
      distanceKm,
    }: {
      eventId: string;
      userId: string;
      distanceKm: number;
    }) => registerForEvent(eventId, userId, distanceKm),
    onSuccess: (registration) => {
      queryClient.setQueryData(
        eventRegistrationKey(registration.event_id),
        registration
      );
      queryClient.setQueryData(
        registrationByIdKey(registration.id),
        registration
      );
      queryClient.invalidateQueries({ queryKey: myRegistrationsKey });
      queryClient.invalidateQueries({
        queryKey: eventCountKey(registration.event_id),
      });
    },
  });
}

export function useCancelRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      registrationId,
    }: {
      registrationId: string;
      eventId: string;
    }) => cancelRegistration(registrationId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: eventRegistrationKey(variables.eventId),
      });
      queryClient.invalidateQueries({
        queryKey: registrationByIdKey(variables.registrationId),
      });
      queryClient.invalidateQueries({ queryKey: myRegistrationsKey });
      queryClient.invalidateQueries({
        queryKey: eventCountKey(variables.eventId),
      });
    },
  });
}