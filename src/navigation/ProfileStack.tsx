import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Profile } from '@/screens/profile/Profile';
import { EditProfile } from '@/screens/profile/EditProfile';
import { PrivateDetails } from '@/screens/profile/PrivateDetails';
import { Settings } from '@/screens/profile/Settings';
import { MyReceipts } from '@/screens/profile/MyReceipts';
import { Receipt } from '@/screens/checkout/Receipt';
import { AdminHome } from '@/screens/admin/AdminHome';
import { NewAnnouncement } from '@/screens/admin/NewAnnouncement';
import { NewAd } from '@/screens/admin/NewAd';
import { CreateEvent } from '@/screens/admin/CreateEvent';
import { UploadResults } from '@/screens/admin/UploadResults';
import { ManageRegistrations } from '@/screens/admin/ManageRegistrations';
import { ManageMembers } from '@/screens/admin/ManageMembers';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  PrivateDetails: undefined;
  Settings: undefined;
  MyReceipts: undefined;
  Receipt: { paymentId: string };
  AdminHome: undefined;
  NewAnnouncement: undefined;
  NewAd: undefined;
  CreateEvent: { eventId?: string } | undefined;
  UploadResults: { eventId?: string } | undefined;
  ManageRegistrations: { eventId?: string } | undefined;
  ManageMembers: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator
      initialRouteName="ProfileHome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5F7EE' },
      }}
    >
      <Stack.Screen name="ProfileHome" component={Profile} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="PrivateDetails" component={PrivateDetails} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="MyReceipts" component={MyReceipts} />
      <Stack.Screen name="Receipt" component={Receipt} />
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