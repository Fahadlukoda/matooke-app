import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

import { ProfileStack } from './ProfileStack';
import { EventsStack } from './EventsStack';
import { RunStack } from './RunStack';
import { HomeStack } from './HomeStack';
import { ResultsStack } from './ResultsStack';
import { FloatingTabBar } from '@/components/FloatingTabBar';

export type MainTabParamList = {
  Home: undefined;
  Events: undefined;
  Run: undefined;
  Results: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => {
        const focusedRoute = props.state.routes[props.state.index];
        if (!focusedRoute) return null;

        const focusedNestedRoute = getFocusedRouteNameFromRoute(focusedRoute);
        const rootRoutes: Record<string, string | undefined> = {
          Home: 'HomeFeed',
          Events: 'EventsList',
          Run: 'RunReady',
          Results: 'MyResults',
          Profile: 'ProfileHome',
        };

        const currentTabRoot = rootRoutes[focusedRoute.name];
        if (focusedNestedRoute && focusedNestedRoute !== currentTabRoot) {
          return null;
        }

        return <FloatingTabBar {...props} />;
      }}
      screenOptions={{
        headerShown: false,
        // Ensure the content doesn't get hidden behind the absolute tab bar
        tabBarStyle: { display: 'none' }, 
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Events" component={EventsStack} />
      <Tab.Screen name="Run" component={RunStack} />
      <Tab.Screen name="Results" component={ResultsStack} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}