import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MyResults } from '@/screens/results/MyResults';
import { EventResults } from '@/screens/results/EventResults';
import { Leaderboard } from '@/screens/results/Leaderboard';

export type ResultsStackParamList = {
  MyResults: undefined;
  EventResults: { eventId: string };
  Leaderboard: undefined;
};

const Stack = createNativeStackNavigator<ResultsStackParamList>();

export function ResultsStack() {
  return (
    <Stack.Navigator
      initialRouteName="MyResults"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5F7EE' },
      }}
    >
      <Stack.Screen name="MyResults" component={MyResults} />
      <Stack.Screen name="EventResults" component={EventResults} />
      <Stack.Screen name="Leaderboard" component={Leaderboard} />
    </Stack.Navigator>
  );
}