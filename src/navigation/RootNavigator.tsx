import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';

import { useAuthStore } from '@/state/auth';
import { useProfile } from '@/hooks/useProfile';
import { useNotifications } from '@/hooks/useNotifications';
import { theme } from '@/theme';
import { AuthStack } from './AuthStack';
import { OnboardingStack } from './OnboardingStack';
import { MainTabs } from './MainTabs';
import { linking, type RootNavigationParamList } from './linking';

export function RootNavigator() {
  const navigationRef =
    useNavigationContainerRef<RootNavigationParamList>();
  const [navigationReady, setNavigationReady] = useState(false);
  const session = useAuthStore((s) => s.session);
  const initialized = useAuthStore((s) => s.initialized);
  const profileQuery = useProfile();
  const onboarded = Boolean(profileQuery.data?.onboarded_at);

  useNotifications(
    navigationRef,
    navigationReady && Boolean(session && onboarded),
  );

  if (!initialized) {
    return null;
  }

  if (session && profileQuery.isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.semantic.bg.page }}>
        <ActivityIndicator color={theme.fills.matooke[500]} />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onReady={() => setNavigationReady(true)}
    >
      {!session ? <AuthStack /> : !onboarded ? <OnboardingStack /> : <MainTabs />}
    </NavigationContainer>
  );
}