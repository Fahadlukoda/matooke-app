import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Lock, Users } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Skeleton } from '@/components/Skeleton';
import { useMyRuns } from '@/hooks/useRuns';
import { formatDuration, formatPace, formatDistanceKm } from '@/hooks/useRun';
import type { RunStackParamList } from '@/navigation/RunStack';

type Props = NativeStackScreenProps<RunStackParamList, 'RunHistory'>;

export function RunHistory({ navigation }: Props) {
  const runsQuery = useMyRuns();
  const runs = runsQuery.data ?? [];

  const grouped = React.useMemo(() => {
    const byMonth = new Map<string, typeof runs>();
    for (const run of runs) {
      const d = new Date(run.started_at);
      const key = d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      const list = byMonth.get(key) ?? [];
      list.push(run);
      byMonth.set(key, list);
    }
    return Array.from(byMonth.entries());
  }, [runs]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Run history" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={runsQuery.isRefetching}
            onRefresh={() => runsQuery.refetch()}
            tintColor={theme.fills.matooke[500]}
          />
        }
      >
        {runsQuery.isLoading ? (
          <View style={styles.list}>
            <Skeleton variant="listRow" />
            <Skeleton variant="listRow" />
            <Skeleton variant="listRow" />
          </View>
        ) : runs.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="bodyL" align="center">
              No runs yet
            </Text>
            <Text
              variant="bodyM"
              color={theme.semantic.text.secondary}
              align="center"
              style={styles.emptySub}
            >
              Start a run from the Run tab to see it here.
            </Text>
          </View>
        ) : (
          grouped.map(([month, monthRuns]) => (
            <View key={month} style={styles.group}>
              <Text variant="caption" color={theme.semantic.text.secondary}>
                {month}
              </Text>
              <View style={styles.groupList}>
                {monthRuns.map((run) => {
                  const pace = run.avg_pace_s;
                  return (
                    <Pressable
                      key={run.id}
                      onPress={() =>
                        navigation.navigate('RunDetail', { runId: run.id })
                      }
                      accessibilityRole="button"
                    >
                      <Card>
                        <View style={styles.headRow}>
                          <View style={styles.headLeft}>
                            <Text variant="displayM" tabular>
                              {formatDistanceKm(run.distance_m)} km
                            </Text>
                            <Text
                              variant="bodyS"
                              color={theme.semantic.text.secondary}
                              tabular
                              style={styles.headMeta}
                            >
                              {new Date(run.started_at).toLocaleDateString('en-GB', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                              })}
                            </Text>
                          </View>
                          <ChevronRight
                            size={18}
                            color={theme.textColors.ink[300]}
                            strokeWidth={2}
                          />
                        </View>

                        <View style={styles.statsRow}>
                          <View style={styles.stat}>
                            <Text variant="caption" color={theme.semantic.text.secondary}>
                              Time
                            </Text>
                            <Text variant="bodyM" tabular>
                              {formatDuration(run.duration_s * 1000)}
                            </Text>
                          </View>
                          <View style={styles.stat}>
                            <Text variant="caption" color={theme.semantic.text.secondary}>
                              Pace
                            </Text>
                            <Text variant="bodyM" tabular>
                              {pace ? formatPace(pace) : '—:—'}
                            </Text>
                          </View>
                          <View style={styles.visIcon}>
                            {run.visibility === 'club' ? (
                              <Users size={16} color={theme.textColors.matooke[600]} strokeWidth={2} />
                            ) : (
                              <Lock size={16} color={theme.textColors.ink[300]} strokeWidth={2} />
                            )}
                          </View>
                        </View>
                      </Card>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))
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
  },
  emptySub: { marginTop: theme.spacing.xs },
  group: { marginBottom: theme.spacing.xl },
  groupList: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headLeft: { flex: 1 },
  headMeta: { marginTop: theme.spacing.xxs },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.xl,
  },
  stat: {},
  visIcon: { marginLeft: 'auto' },
});