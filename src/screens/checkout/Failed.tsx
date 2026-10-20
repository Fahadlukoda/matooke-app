import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { usePayment } from '@/hooks/usePayments';
import { useRegistrationById } from '@/hooks/useEvents';
import { formatUgx, methodLabel } from '@/lib/payments';
import { track } from '@/lib/analytics';
import type { EventsStackParamList } from '@/navigation/EventsStack';

type Props = NativeStackScreenProps<EventsStackParamList, 'Failed'>;

export function Failed({ route, navigation }: Props) {
  const { paymentId } = route.params;

  const paymentQuery = usePayment(paymentId);
  const payment = paymentQuery.data;
  const registrationQuery = useRegistrationById(
    payment?.registration_id ?? undefined
  );

  React.useEffect(() => {
    if (payment?.status === 'failed') {
      track('payment_failed', {
        event_id: registrationQuery.data?.event_id ?? '',
        reason: 'provider_declined',
      });
    }
  }, [payment?.status, registrationQuery.data?.event_id]);

  const eventId = registrationQuery.data?.event_id;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroBlock}>
          <AlertCircle size={56} color={theme.fills.clay[500]} strokeWidth={1.75} />
          <Text variant="displayL" align="center" style={styles.heading}>
            Payment didn't go through
          </Text>
          <Text
            variant="bodyM"
            color={theme.semantic.text.secondary}
            align="center"
            style={styles.sub}
          >
            Your registration is still held. Try again with the same method or a
            different one.
          </Text>
        </View>

        {payment ? (
          <Card>
            <Text variant="caption" color={theme.semantic.text.secondary}>
              Attempt
            </Text>
            <Text variant="displayM" tabular style={styles.amount}>
              {formatUgx(payment.amount_ugx)}
            </Text>
            <Text
              variant="bodyS"
              color={theme.semantic.text.secondary}
              tabular
              style={styles.meta}
            >
              {methodLabel(payment.method)} · Ref {payment.merchant_reference}
            </Text>
          </Card>
        ) : null}

        <View style={styles.gap} />

        <Button
          label="Try again"
          onPress={() => {
            if (eventId) navigation.replace('MethodSelect', { eventId });
            else navigation.popToTop();
          }}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!eventId}
        />
        <View style={styles.gapSm} />
        <Button
          label="Back to events"
          onPress={() => navigation.popToTop()}
          variant="ghost"
          size="lg"
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing['2xl'] },
  heroBlock: {
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
  },
  heading: { marginTop: theme.spacing.md },
  sub: { marginTop: theme.spacing.xs, maxWidth: 320 },
  amount: { marginTop: theme.spacing.xs },
  meta: { marginTop: theme.spacing.xs },
  gap: { height: theme.spacing.xl },
  gapSm: { height: theme.spacing.sm },
});