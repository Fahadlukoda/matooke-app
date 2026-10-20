import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { ChevronRight, Trophy } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Divider } from '@/components/Divider';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatGrid } from '@/components/StatGrid';
import { useMyPersonalBests } from '@/hooks/useResults';
import { formatResultTime, formatPace } from '@/lib/results';
import { useMyRuns } from '@/hooks/useRuns';
import { formatDistanceKm, formatDuration } from '@/hooks/useRun';
import type { ResultsStackParamList } from '@/navigation/ResultsStack';

type Props = NativeStackScreenProps<ResultsStackParamList, 'MyResults'>;

const DISTANCE_LABEL: Record<number, string> = {
  5: '5k',
  10: '10k',
  21: '21k',
  42: '42k',
};

export function MyResults({ navigation }: Props) {
  const bestsQuery = useMyPersonalBests();
  const bests = bestsQuery.data ?? [];
  const runsQuery = useMyRuns();

  return (
    <View style={styles.safe}>
      

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="displayL" style={styles.pageTitle}>
          Results
        </Text>
        <Text
          variant="bodyM"
          color={theme.semantic.text.secondary}
          style={styles.pageSubtitle}
        >
          Your fastest times, records, and progress.
        </Text>

        <Pressable
          onPress={() => navigation.navigate('Leaderboard')}
          accessibilityRole="button"
          style={styles.leaderboardButton}
        >
          <Card padding={theme.spacing.md} style={styles.leaderboardCard}>
            <View style={styles.leaderboardRow}>
              <View style={styles.leaderboardLabel}>
                <Trophy size={20} color={theme.fills.gold[500]} strokeWidth={2} />
                <Text variant="bodyM" color={theme.semantic.text.brand}>
                  View Club Leaderboard
                </Text>
              </View>
              <ChevronRight
                size={20}
                color={theme.semantic.text.tertiary}
                strokeWidth={2}
              />
            </View>
          </Card>
        </Pressable>

        <View style={styles.section}>
          <Text variant="caption" color={theme.semantic.text.secondary}>
            Personal Bests
          </Text>
          {bestsQuery.isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={theme.fills.matooke[500]} />
            </View>
          ) : bests.length === 0 ? (
            <View style={styles.empty}>
              <Trophy size={32} color={theme.textColors.ink[300]} strokeWidth={1.75} />
              <Text variant="bodyL" align="center" style={styles.emptyHeading}>
                No personal bests yet
              </Text>
              <Text
                variant="bodyM"
                color={theme.semantic.text.secondary}
                align="center"
                style={styles.emptySub}
              >
                Finish a 5k, 10k, 21k, or 42k — a run or a race — and your best time
                lands here.
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {bests.map((pb) => (
                <Card key={pb.distance_km}>
                  <View style={styles.pbHead}>
                    <Text variant="displayM">
                      {DISTANCE_LABEL[pb.distance_km] ?? `${pb.distance_km}k`}
                    </Text>
                    <Text variant="bodyS" color={theme.semantic.text.secondary}>
                      {pb.source === 'race' ? 'Race' : 'Training run'}
                    </Text>
                  </View>
                  <Divider style={styles.pbDivider} />
                  <StatGrid
                    columns={2}
                    cells={[
                      { label: 'Time', value: formatResultTime(pb.best_duration_s) },
                      {
                        label: 'Pace',
                        value: formatPace(
                          Math.round(pb.best_duration_s / Number(pb.distance_km))
                        ),
                      },
                    ]}
                  />
                  <Text
                    variant="bodyS"
                    color={theme.semantic.text.tertiary}
                    style={styles.pbDate}
                  >
                    Achieved{' '}
                    {new Date(pb.achieved_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </Card>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text variant="caption" color={theme.semantic.text.secondary}>
            Recent Runs
          </Text>
          {runsQuery.isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={theme.fills.matooke[500]} />
            </View>
          ) : runsQuery.isError ? (
            <Text variant="bodyS" color={theme.semantic.text.secondary} style={styles.message}>
              Could not load recent runs.
            </Text>
          ) : (runsQuery.data ?? []).length === 0 ? (
            <Text variant="bodyS" color={theme.semantic.text.secondary} style={styles.message}>
              Your recent runs will appear here.
            </Text>
          ) : (
            <View style={styles.list}>
              {(runsQuery.data ?? []).slice(0, 3).map((run) => (
                <Pressable
                  key={run.id}
                  onPress={() =>
                    navigation.getParent()?.navigate('Run', {
                      screen: 'RunDetail',
                      params: { runId: run.id },
                    })
                  }
                  accessibilityRole="button"
                >
                  <Card padding={theme.spacing.md}>
                    <View style={styles.runRow}>
                      <View style={styles.runInfo}>
                        <Text variant="bodyS" color={theme.semantic.text.secondary}>
                          {new Date(run.started_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                        <Text variant="bodyM" style={styles.runStats} tabular>
                          {formatDistanceKm(run.distance_m)} km · {formatDuration(run.duration_s * 1000)}
                        </Text>
                      </View>
                      <ChevronRight
                        size={20}
                        color={theme.semantic.text.tertiary}
                        strokeWidth={2}
                      />
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 120,
  },
  pageTitle: { marginTop: theme.spacing.xs },
  pageSubtitle: { marginTop: theme.spacing.xs },
  leaderboardButton: { marginTop: theme.spacing.lg },
  leaderboardCard: { marginTop: 0 },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leaderboardLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  section: { marginTop: theme.spacing.xl },
  message: { marginTop: theme.spacing.sm },
  center: { paddingVertical: theme.spacing['4xl'], alignItems: 'center' },
  list: { gap: theme.spacing.md, marginTop: theme.spacing.sm },
  empty: {
    paddingVertical: theme.spacing['4xl'],
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  emptyHeading: { marginTop: theme.spacing.xs },
  emptySub: { maxWidth: 300 },
  pbHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  pbDivider: { marginVertical: theme.spacing.md },
  pbDate: { marginTop: theme.spacing.md },
  runRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  runInfo: { flex: 1 },
  runStats: { marginTop: theme.spacing.xxs },
});