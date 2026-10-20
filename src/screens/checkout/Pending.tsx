import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { usePayment } from '@/hooks/usePayments';
import type { EventsStackParamList } from '@/navigation/EventsStack';

type Props = NativeStackScreenProps<EventsStackParamList, 'Pending'>;

export function Pending({ route, navigation }: Props) {
  const { paymentId } = route.params;
  const paymentQuery = usePayment(paymentId);

  useEffect(() => {
    const status = paymentQuery.data?.status;
    if (status === 'succeeded') {
      navigation.replace('Success', { paymentId });
    } else if (status === 'failed') {
      navigation.replace('Failed', { paymentId });
    }
  }, [paymentQuery.data?.status, navigation, paymentId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.body}>
          <ActivityIndicator size="large" color={theme.fills.matooke[500]} />
          <Text variant="displayM" align="center" style={styles.heading}>
            Waiting for confirmation
          </Text>
          <Text
            variant="bodyM"
            color={theme.semantic.text.secondary}
            align="center"
            style={styles.sub}
          >
            Approve the PIN prompt on your phone. This page updates automatically.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Check again"
            onPress={() => paymentQuery.refetch()}
            variant="secondary"
            size="lg"
            fullWidth
            disabled={paymentQuery.isFetching}
            loading={paymentQuery.isFetching}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  body: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heading: { marginTop: theme.spacing.lg },
  sub: { marginTop: theme.spacing.sm, maxWidth: 320 },
  actions: { paddingTop: theme.spacing.lg },
});