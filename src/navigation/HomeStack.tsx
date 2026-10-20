import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HomeFeed } from '@/screens/home/HomeFeed';
import { PostDetail } from '@/screens/home/PostDetail';

export type HomeStackParamList = {
  HomeFeed: undefined;
  PostDetail: { postId: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator
      initialRouteName="HomeFeed"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5F7EE' },
      }}
    >
      <Stack.Screen name="HomeFeed" component={HomeFeed} />
      <Stack.Screen name="PostDetail" component={PostDetail} />
    </Stack.Navigator>
  );
}