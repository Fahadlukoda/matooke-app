import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { EventsList } from '@/screens/events/EventsList';
import { EventDetail } from '@/screens/events/EventDetail';
import { MyRegistrations } from '@/screens/events/MyRegistrations';
import { MethodSelect } from '@/screens/checkout/MethodSelect';
import { MockCheckout } from '@/screens/checkout/MockCheckout';
import { Pending } from '@/screens/checkout/Pending';
import { Success } from '@/screens/checkout/Success';
import { Failed } from '@/screens/checkout/Failed';
import { Receipt } from '@/screens/checkout/Receipt';
import type { PaymentMethod } from '@/lib/payments';

export type EventsStackParamList = {
  EventsList: undefined;
  EventDetail: { eventId: string };
  MyRegistrations: undefined;
  MethodSelect: { eventId: string };
  MockCheckout: {
    paymentId: string;
    merchantReference: string;
    providerRef: string;
    amountUgx: number;
    method: PaymentMethod;
    phone: string;
  };
  Pending: { paymentId: string };
  Success: { paymentId: string };
  Failed: { paymentId: string; reason?: string };
  Receipt: { paymentId: string };
};

const Stack = createNativeStackNavigator<EventsStackParamList>();

export function EventsStack() {
  return (
    <Stack.Navigator
      initialRouteName="EventsList"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5F7EE' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="EventsList" component={EventsList} />
      <Stack.Screen name="EventDetail" component={EventDetail} />
      <Stack.Screen name="MyRegistrations" component={MyRegistrations} />
      
      {/* Modal-style transitions for checkout flow */}
      <Stack.Group screenOptions={{ animation: 'fade_from_bottom' }}>
        <Stack.Screen name="MethodSelect" component={MethodSelect} />
        <Stack.Screen name="MockCheckout" component={MockCheckout} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Pending" component={Pending} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Success" component={Success} options={{ gestureEnabled: false }} />
      </Stack.Group>

      <Stack.Screen name="Failed" component={Failed} />
      <Stack.Screen name="Receipt" component={Receipt} />
    </Stack.Navigator>
  );
}