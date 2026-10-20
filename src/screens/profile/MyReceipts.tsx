import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Receipt as ReceiptIcon } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Skeleton } from '@/components/Skeleton';
import { useMyReceipts } from '@/hooks/usePayments';
import { formatUgx, methodLabel, statusLabel } from '@/lib/payments';
import type { ProfileStackParamList } from '@/navigation/ProfileStack';

type Props = NativeStackScreenProps<ProfileStackParamList, 'MyReceipts'>;

export function MyReceipts({ navigation }: Props) {
  const receiptsQuery = useMyReceipts();
  const receipts = receiptsQuery.data ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="My receipts" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {receiptsQuery.isLoading ? (
          <View style={styles.list}>
            <Skeleton variant="listRow" />
            <Skeleton variant="listRow" />
            <Skeleton variant="listRow" />
          </View>
        ) : receipts.length === 0 ? (
          <View style={styles.empty}>
            <ReceiptIcon size={32} color={theme.textColors.ink[300]} strokeWidth={1.75} />
            <Text variant="bodyL" align="center" style={styles.emptyHeading}>
              No receipts yet
            </Text>
            <Text
              variant="bodyM"
              color={theme.semantic.text.secondary}
              align="center"
              style={styles.emptySub}
            >
              Receipts appear here after you pay for a marathon or event.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {receipts.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => navigation.navigate('Receipt', { paymentId: p.id })}
                accessibilityRole="button"
                accessibilityLabel={`Receipt for ${formatUgx(p.amount_ugx)}`}
              >
                <Card>
                  <View style={styles.head}>
                    <Text variant="displayM" tabular>
                      {formatUgx(p.amount_ugx)}
                    </Text>
                    <View style={styles.headRight}>
                      <Badge
                        label={statusLabel(p.status)}
                        variant={p.status === 'succeeded' ? 'success' : 'warning'}
                        size="sm"
                      />
                      <ChevronRight
                        size={18}
                        color={theme.textColors.ink[300]}
                        strokeWidth={2}
                      />
                    </View>
                  </View>
                  <Text
                    variant="bodyS"
                    color={theme.semantic.text.secondary}
                    tabular
                    style={styles.meta}
                  >
                    {methodLabel(p.method)} ·{' '}
                    {new Date(p.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </Card>
              </Pressable>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing['2xl'] },
  list: { gap: theme.spacing.sm },
  empty: {
    paddingVertical: theme.spacing['4xl'],
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyHeading: { marginTop: theme.spacing.xs },
  emptySub: { maxWidth: 280 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  headRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  meta: { marginTop: theme.spacing.xs },
});