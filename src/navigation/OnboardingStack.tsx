import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Identity } from '@/screens/onboarding/Identity';
import { LocationLevel } from '@/screens/onboarding/LocationLevel';
import { Safety } from '@/screens/onboarding/Safety';
import { Done } from '@/screens/onboarding/Done';

export type OnboardingStackParamList = {
  Identity: undefined;
  LocationLevel: undefined;
  Safety: undefined;
  Done: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingStack() {
  return (
    <Stack.Navigator
      initialRouteName="Identity"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5F7EE' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Identity" component={Identity} />
      <Stack.Screen name="LocationLevel" component={LocationLevel} />
      <Stack.Screen name="Safety" component={Safety} />
      <Stack.Screen name="Done" component={Done} />
    </Stack.Navigator>
  );
}