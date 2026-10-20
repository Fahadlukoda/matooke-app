import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AdminHome } from '@/screens/admin/AdminHome';
import { NewAnnouncement } from '@/screens/admin/NewAnnouncement';
import { NewAd } from '@/screens/admin/NewAd';
import { CreateEvent } from '@/screens/admin/CreateEvent';
import { UploadResults } from '@/screens/admin/UploadResults';
import { ManageRegistrations } from '@/screens/admin/ManageRegistrations';
import { ManageMembers } from '@/screens/admin/ManageMembers';

export type AdminStackParamList = {
  AdminHome: undefined;
  NewAnnouncement: undefined;
  NewAd: undefined;
  CreateEvent: { eventId?: string } | undefined;
  UploadResults: { eventId?: string } | undefined;
  ManageRegistrations: { eventId?: string } | undefined;
  ManageMembers: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminStack() {
  return (
    <Stack.Navigator
      initialRouteName="AdminHome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5F7EE' },
      }}
    >
      <Stack.Screen name="AdminHome" component={AdminHome} />
      <Stack.Screen name="NewAnnouncement" component={NewAnnouncement} />
      <Stack.Screen name="NewAd" component={NewAd} />
      <Stack.Screen name="CreateEvent" component={CreateEvent} />
      <Stack.Screen name="UploadResults" component={UploadResults} />
      <Stack.Screen name="ManageRegistrations" component={ManageRegistrations} />
      <Stack.Screen name="ManageMembers" component={ManageMembers} />
    </Stack.Navigator>
  );
}