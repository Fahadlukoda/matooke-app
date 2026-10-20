import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Chip } from '@/components/Chip';
import { Card } from '@/components/Card';
import { Divider } from '@/components/Divider';
import { ScreenHeader } from '@/components/ScreenHeader';
import { ResultRow } from '@/components/ResultRow';
import { useEvent } from '@/hooks/useEvents';
import { useEventResults } from '@/hooks/useResults';
import { useAuthStore } from '@/state/auth';
import { useProfile } from '@/hooks/useProfile';
import { formatEventDate } from '@/lib/events';
import type { ResultsStackParamList } from '@/navigation/ResultsStack';

type Props = NativeStackScreenProps<ResultsStackParamList, 'EventResults'>;

export function EventResults({ route, navigation }: Props) {
  const { eventId } = route.params;
  const eventQuery = useEvent(eventId);
  const resultsQuery = useEventResults(eventId);
  const profileQuery = useProfile();
  const user = useAuthStore((s) => s.user);

  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);
  const [genderFilter, setGenderFilter] = useState<string | null>(null);

  const results = resultsQuery.data ?? [];
  const event = eventQuery.data;
  const myProfileId = profileQuery.data?.id ?? null;

  const distances = useMemo(
    () => Array.from(new Set(results.map((r) => r.distance_km))).sort((a, b) => a - b),
    [results]
  );

  const filtered = useMemo(() => {
    return results.filter((r) => {
      if (distanceFilter != null && r.distance_km !== distanceFilter) return false;
      if (genderFilter != null && r.gender !== genderFilter) return false;
      return true;
    });
  }, [results, distanceFilter, genderFilter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title={event ? event.title : 'Results'}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {event ? (
          <Text variant="bodyS" color={theme.semantic.text.secondary} style={styles.eventMeta}>
            {formatEventDate(event.start_at)} · {event.venue_name}
          </Text>
        ) : null}

        <View style={styles.gapLg} />

        {distances.length > 0 ? (
          <>
            <Text variant="caption" color={theme.semantic.text.secondary}>
              Distance
            </Text>
            <View style={styles.chipRow}>
              <Chip
                label="All"
                selected={distanceFilter === null}
                onPress={() => setDistanceFilter(null)}
              />
              {distances.map((d) => (
                <Chip
                  key={d}
                  label={`${d}k`}
                  selected={distanceFilter === d}
                  onPress={() => setDistanceFilter(d)}
                />
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.gapMd} />

        <Text variant="caption" color={theme.semantic.text.secondary}>
          Category
        </Text>
        <View style={styles.chipRow}>
          <Chip
            label="All"
            selected={genderFilter === null}
            onPress={() => setGenderFilter(null)}
          />
          <Chip
            label="Women"
            selected={genderFilter === 'female'}
            onPress={() => setGenderFilter('female')}
          />
          <Chip
            label="Men"
            selected={genderFilter === 'male'}
            onPress={() => setGenderFilter('male')}
          />
        </View>

        <View style={styles.gapLg} />

        {filtered.length === 0 ? (
          <Pressable onPress={() => resultsQuery.refetch()}>
            <Text variant="bodyM" color={theme.semantic.text.secondary} align="center">
              {resultsQuery.isLoading
                ? 'Loading results…'
                : 'No results match these filters.'}
            </Text>
          </Pressable>
        ) : (
          <Card padding={0}>
            <View style={styles.tableHead}>
              <Text variant="caption" color={theme.semantic.text.secondary} style={styles.posHead}>
                Pos
              </Text>
              <Text variant="caption" color={theme.semantic.text.secondary} style={styles.nameHead}>
                Runner
              </Text>
              <Text variant="caption" color={theme.semantic.text.secondary} style={styles.timeHead}>
                Time
              </Text>
              <Text variant="caption" color={theme.semantic.text.secondary} style={styles.paceHead}>
                Pace
              </Text>
            </View>
            {filtered.map((r, i) => {
              const isMe = Boolean(user && r.user_id === myProfileId);
              const rowTint =
                !isMe && r.position != null && r.position <= 3
                  ? r.position === 1
                    ? 'rgba(229, 199, 102, 0.10)'
                    : r.position === 2
                      ? 'rgba(168, 169, 172, 0.10)'
                      : 'rgba(200, 90, 44, 0.08)'
                  : undefined;

              return (
                <React.Fragment key={r.id}>
                  {i > 0 ? <Divider inset={theme.spacing.lg} /> : null}
                  <View style={rowTint ? [styles.topThreeRow, { backgroundColor: rowTint }] : undefined}>
                    <ResultRow
                      position={r.position}
                      name={r.display_name}
                      time={r.duration_s}
                      pace={r.pace_s}
                      isMe={isMe}
                    />
                  </View>
                </React.Fragment>
              );
            })}
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing['2xl'] },
  eventMeta: { marginTop: theme.spacing.xs },
  gapMd: { height: theme.spacing.md },
  gapLg: { height: theme.spacing.lg },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  posHead: { width: 44 },
  nameHead: { flex: 1 },
  timeHead: { width: 76, textAlign: 'right' },
  paceHead: { width: 56, textAlign: 'right', marginLeft: theme.spacing.sm },
  topThreeRow: { width: '100%' },
});