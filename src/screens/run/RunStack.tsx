import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { RunReady } from "@/screens/run/RunReady";
import { RunLive } from "@/screens/run/RunLive";
import { RunSummary } from "@/screens/run/RunSummary";

export type RunStackParamList = {
  RunReady: undefined;
  RunLive: { eventId: string | null };
  RunSummary: undefined;
  RunHistory: undefined;
  RunDetail: { runId: string };
};

const Stack = createNativeStackNavigator<RunStackParamList>();

export function RunStack() {
  return (
    <Stack.Navigator
      initialRouteName="RunReady"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F5F7EE" },
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="RunReady" component={RunReady} />
      <Stack.Screen name="RunLive" component={RunLive} />
      <Stack.Screen name="RunSummary" component={RunSummary} />
    </Stack.Navigator>
  );
}
