import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ticket } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Skeleton } from '@/components/Skeleton';
import { useMyRegistrations, useEvents } from '@/hooks/useEvents';
import { formatEventDate, formatDistance } from '@/lib/events';
import type { EventsStackParamList } from '@/navigation/EventsStack';

type Props = NativeStackScreenProps<EventsStackParamList, 'MyRegistrations'>;

export function MyRegistrations({ navigation }: Props) {
  const regsQuery = useMyRegistrations();
  const eventsQuery = useEvents();

  const regs = regsQuery.data ?? [];
  const eventsById = new Map((eventsQuery.data ?? []).map((e) => [e.id, e]));

  const active = regs.filter((r) => r.status !== 'cancelled' && r.status !== 'refunded');
  const past = regs.filter((r) => r.status === 'cancelled' || r.status === 'refunded');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="My registrations" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {regsQuery.isLoading ? (
          <View style={styles.list}>
            <Skeleton variant="card" />
            <Skeleton variant="card" />
          </View>
        ) : regs.length === 0 ? (
          <View style={styles.empty}>
            <Ticket size={32} color={theme.textColors.ink[300]} strokeWidth={1.75} />
            <Text variant="bodyL" align="center" style={styles.emptyHeading}>
              No registrations yet
            </Text>
            <Text
              variant="bodyM"
              color={theme.semantic.text.secondary}
              align="center"
              style={styles.emptySub}
            >
              Browse events and register for a training run or Marathons.
            </Text>
          </View>
        ) : (
          <>
            {active.length > 0 ? (
              <>
                <Text variant="caption" color={theme.semantic.text.secondary}>
                  Upcoming
                </Text>
                <View style={styles.list}>
                  {active.map((reg) => {
                    const event = eventsById.get(reg.event_id);
                    if (!event) return null;
                    return (
                      <Pressable
                        key={reg.id}
                        onPress={() =>
                          navigation.navigate('EventDetail', { eventId: event.id })
                        }
                        accessibilityRole="button"
                      >
                        <Card>
                          <View style={styles.cardHead}>
                            <Text variant="bodyL" numberOfLines={1} style={styles.cardTitle}>
                              {event.title}
                            </Text>
                            <Badge
                              label={
                                reg.status === 'confirmed' || reg.status === 'paid'
                                  ? 'Confirmed'
                                  : 'Pending'
                              }
                              variant={
                                reg.status === 'confirmed' || reg.status === 'paid'
                                  ? 'success'
                                  : 'warning'
                              }
                              size="sm"
                            />
                          </View>
                          <View style={styles.metaRow}>
                            <Text
                              variant="bodyS"
                              color={theme.semantic.text.secondary}
                              tabular
                            >
                              {formatEventDate(event.start_at)}
                            </Text>
                            <Text
                              variant="bodyS"
                              color={theme.semantic.text.brand}
                              tabular
                            >
                              {formatDistance(reg.distance_km)}
                            </Text>
                            {reg.bib ? (
                              <Text
                                variant="bodyS"
                                color={theme.semantic.text.secondary}
                                tabular
                              >
                                Bib {reg.bib}
                              </Text>
                            ) : null}
                          </View>
                        </Card>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {past.length > 0 ? (
              <>
                <Text
                  variant="caption"
                  color={theme.semantic.text.secondary}
                  style={styles.pastHeading}
                >
                  Cancelled
                </Text>
                <View style={styles.list}>
                  {past.map((reg) => {
                    const event = eventsById.get(reg.event_id);
                    if (!event) return null;
                    return (
                      <Pressable
                        key={reg.id}
                        onPress={() =>
                          navigation.navigate('EventDetail', { eventId: event.id })
                        }
                        accessibilityRole="button"
                      >
                        <Card>
                          <View style={styles.cardHead}>
                            <Text variant="bodyL" numberOfLines={1} style={styles.cardTitle}>
                              {event.title}
                            </Text>
                            <Badge label="Cancelled" variant="neutral" size="sm" />
                          </View>
                          <Text
                            variant="bodyS"
                            color={theme.semantic.text.secondary}
                            tabular
                            style={styles.metaRow}
                          >
                            {formatEventDate(event.start_at)} · {formatDistance(reg.distance_km)}
                          </Text>
                        </Card>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing['2xl'] },
  list: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
  empty: {
    paddingVertical: theme.spacing['4xl'],
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  emptyHeading: { marginTop: theme.spacing.xs },
  emptySub: { maxWidth: 280 },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  cardTitle: { flex: 1 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xs,
    flexWrap: 'wrap',
  },
  pastHeading: { marginTop: theme.spacing.xl },
});