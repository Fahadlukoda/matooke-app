import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Divider } from '@/components/Divider';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatGrid } from '@/components/StatGrid';
import { useReceipt } from '@/hooks/useReceipt';
import { formatUgx, methodLabel } from '@/lib/payments';
import { formatEventDate, formatEventTime, formatDistance } from '@/lib/events';
import type { EventsStackParamList } from '@/navigation/EventsStack';

type Props = NativeStackScreenProps<EventsStackParamList, 'Receipt'>;

export function Receipt({ route, navigation }: Props) {
  const { paymentId } = route.params;
  const receiptQuery = useReceipt(paymentId);
  const receipt = receiptQuery.data;

  if (receiptQuery.isLoading || !receipt) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Receipt" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          {receiptQuery.isError ? (
            <Text variant="bodyM" color={theme.semantic.text.danger}>
              Couldn't load receipt. Check your connection.
            </Text>
          ) : (
            <ActivityIndicator color={theme.fills.matooke[500]} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const { registration } = receipt;
  const event = registration.event;

  const isPaid = receipt.status === 'succeeded';
  const statusLabel = isPaid ? 'Paid' : receipt.status === 'refunded' ? 'Refunded' : 'Failed';
  const statusVariant = isPaid ? 'success' : receipt.status === 'refunded' ? 'warning' : 'danger';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Receipt" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <View style={styles.headerRow}>
            <Badge
              label={event.type === 'marathon' ? 'Marathon' : 'Training Run'}
              variant={event.type === 'marathon' ? 'gold' : 'success'}
              size="sm"
            />
            <Badge label={statusLabel} variant={statusVariant as any} size="sm" />
          </View>

          <Text variant="displayM" style={styles.eventTitle}>
            {event.title}
          </Text>

          <Text
            variant="bodyS"
            color={theme.semantic.text.secondary}
            tabular
            style={styles.eventMeta}
          >
            {formatEventDate(event.start_at)} · {formatEventTime(event.start_at)}
          </Text>
          <Text variant="bodyS" color={theme.semantic.text.secondary} style={styles.eventMeta}>
            {event.venue_name}
          </Text>

          <Divider style={styles.divider} />

          <View style={styles.ticketRow}>
            <View style={styles.ticketCell}>
              <Text variant="caption" color={theme.semantic.text.secondary}>
                Distance
              </Text>
              <Text variant="displayM" tabular>
                {formatDistance(registration.distance_km)}
              </Text>
            </View>
            <View style={styles.ticketDivider} />
            <View style={styles.ticketCell}>
              <Text variant="caption" color={theme.semantic.text.secondary}>
                Bib
              </Text>
              <Text variant="displayM" tabular>
                {registration.bib ?? '—'}
              </Text>
            </View>
          </View>

          {registration.bib == null && isPaid ? (
            <Text
              variant="bodyS"
              color={theme.semantic.text.secondary}
              style={styles.bibNote}
            >
              Your bib number will appear here once the club assigns it.
            </Text>
          ) : null}
        </Card>

        <View style={styles.gap} />

        <Card>
          <Text variant="caption" color={theme.semantic.text.secondary}>
            Payment
          </Text>

          <View style={styles.amountBlock}>
            <Text variant="displayL" tabular>
              {formatUgx(receipt.amount_ugx)}
            </Text>
          </View>

          <StatGrid
            columns={2}
            cells={[
              { label: 'Method', value: methodLabel(receipt.method) },
              { label: 'Status', value: statusLabel },
              {
                label: 'Reference',
                value: receipt.merchant_reference.split('-').slice(-1)[0] ?? receipt.merchant_reference,
              },
              {
                label: 'Date',
                value: new Date(receipt.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }),
              },
            ]}
          />

          <Divider style={styles.divider} />

          <View style={styles.refRow}>
            <Text variant="bodyS" color={theme.semantic.text.secondary}>
              Full reference
            </Text>
            <Text variant="bodyS" tabular selectable>
              {receipt.merchant_reference}
            </Text>
          </View>

          {receipt.phone ? (
            <View style={[styles.refRow, { marginTop: theme.spacing.xs }]}>
              <Text variant="bodyS" color={theme.semantic.text.secondary}>
                Charged to
              </Text>
              <Text variant="bodyS" tabular>
                {receipt.phone}
              </Text>
            </View>
          ) : null}
        </Card>

        {isPaid ? (
          <>
            <View style={styles.gap} />
            <Button
              label="Download PDF"
              onPress={() => {}}
              variant="secondary"
              size="lg"
              fullWidth
              disabled
              leadingIcon={
                <Download size={16} color={theme.textColors.ink[500]} strokeWidth={2} />
              }
            />
            <Text
              variant="bodyS"
              color={theme.semantic.text.secondary}
              align="center"
              style={styles.downloadNote}
            >
              PDF download arrives in the next release.
            </Text>
          </>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg },
  scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing['2xl'] },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  eventTitle: { marginBottom: theme.spacing.xs },
  eventMeta: { marginTop: theme.spacing.xxs },
  divider: { marginVertical: theme.spacing.lg },
  ticketRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketCell: { flex: 1, alignItems: 'center' },
  ticketDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.fills.matooke[200],
  },
  bibNote: {
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  amountBlock: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  gap: { height: theme.spacing.lg },
  downloadNote: { marginTop: theme.spacing.xs },
});