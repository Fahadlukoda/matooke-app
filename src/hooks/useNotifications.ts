import { useEffect, useState } from 'react';
import type { NavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

import { registerForPushNotificationsAsync } from '@/lib/notifications';
import type { RootNavigationParamList } from '@/navigation/linking';

type NotificationData = {
  type?: unknown;
  id?: unknown;
};

function getNotificationData(
  response: Notifications.NotificationResponse,
): NotificationData {
  return response.notification.request.content.data as NotificationData;
}

export function useNotifications(
  navigationRef: NavigationContainerRef<RootNavigationParamList>,
  canNavigate: boolean,
) {
  const [pendingResponse, setPendingResponse] =
    useState<Notifications.NotificationResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    void registerForPushNotificationsAsync()
      .then((token) => {
        if (token && __DEV__) console.info('Expo push token:', token);
      })
      .catch((error: unknown) => {
        console.warn('Could not register for push notifications.', error);
      });

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        setPendingResponse(response);
      });

    void Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (mounted && response) setPendingResponse(response);
      })
      .catch((error: unknown) => {
        console.warn('Could not read the last notification response.', error);
      });

    return () => {
      mounted = false;
      responseSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!canNavigate || !navigationRef.isReady() || !pendingResponse) return;

    const { type, id } = getNotificationData(pendingResponse);
    if (type === 'event' && typeof id === 'string') {
      navigationRef.navigate('Events', {
        screen: 'EventDetail',
        params: { eventId: id },
      });
    } else if (type === 'event_results' && typeof id === 'string') {
      navigationRef.navigate('Results', {
        screen: 'EventResults',
        params: { eventId: id },
      });
    } else if (type === 'leaderboard') {
      navigationRef.navigate('Results', {
        screen: 'Leaderboard',
      });
    } else if (type === 'run' && typeof id === 'string') {
      navigationRef.navigate('Run', {
        screen: 'RunDetail',
        params: { runId: id },
      });
    } else if (type === 'registrations') {
      navigationRef.navigate('Events', {
        screen: 'MyRegistrations',
      });
    } else {
      console.warn('Notification tap had an unsupported navigation payload.', {
        type,
        id,
      });
    }

    setPendingResponse(null);
  }, [canNavigate, navigationRef, pendingResponse]);
}
