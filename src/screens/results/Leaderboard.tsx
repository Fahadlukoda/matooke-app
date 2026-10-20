import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Divider } from '@/components/Divider';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useLeaderboard } from '@/hooks/useResults';
import { formatLeaderboardDistance } from '@/lib/results';
import { useProfile } from '@/hooks/useProfile';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ResultsStackParamList } from '@/navigation/ResultsStack';
import type { LeaderboardPeriod } from '@/lib/results';

type Props = NativeStackScreenProps<ResultsStackParamList, 'Leaderboard'>;

export function Leaderboard({ navigation }: Props) {
  const [period, setPeriod] = useState<LeaderboardPeriod>('month');
  const leaderboardQuery = useLeaderboard(period);
  const profileQuery = useProfile();

  const rows = leaderboardQuery.data ?? [];
  const myProfileId = profileQuery.data?.id ?? null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Leaderboard" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={leaderboardQuery.isRefetching}
            onRefresh={() => leaderboardQuery.refetch()}
            tintColor={theme.fills.matooke[500]}
          />
        }
      >
        <Text variant="bodyM" color={theme.semantic.text.secondary} style={styles.sub}>
          Total distance by member.
        </Text>

        <View style={styles.gapLg} />

        <View style={styles.chipRow}>
          <Chip
            label="This month"
            selected={period === 'month'}
            onPress={() => setPeriod('month')}
          />
          <Chip
            label="90 days"
            selected={period === 'quarter'}
            onPress={() => setPeriod('quarter')}
          />
          <Chip
            label="This year"
            selected={period === 'year'}
            onPress={() => setPeriod('year')}
          />
        </View>

        <View style={styles.gapLg} />

        {leaderboardQuery.isLoading ? (
          <Text variant="bodyM" color={theme.semantic.text.secondary} align="center">
            Loading…
          </Text>
        ) : rows.length === 0 ? (
          <Text variant="bodyM" color={theme.semantic.text.secondary} align="center">
            No runs logged in this period.
          </Text>
        ) : (
          <Card padding={0}>
            <View style={styles.tableHead}>
              <Text
                variant="caption"
                color={theme.semantic.text.secondary}
                style={styles.rankHead}
              >
                #
              </Text>
              <Text
                variant="caption"
                color={theme.semantic.text.secondary}
                style={styles.nameHead}
              >
                Runner
              </Text>
              <Text
                variant="caption"
                color={theme.semantic.text.secondary}
                style={styles.distHead}
              >
                Distance
              </Text>
            </View>

            {rows.map((row, i) => {
              const isMe = myProfileId === row.profile_id;
              const isTop3 = i < 3;
              const rankColor =
                i === 0
                  ? theme.fills.gold[500]
                  : i === 1
                    ? theme.textColors.ink[500]
                    : i === 2
                      ? theme.fills.clay[500]
                      : undefined;

              return (
                <React.Fragment key={row.profile_id}>
                  {i > 0 ? <Divider inset={theme.spacing.lg} /> : null}
                  <View style={[styles.row, isMe && styles.rowMe, isMe && styles.rowMeLeftBorder]}>
                    <Text
                      variant="bodyM"
                      tabular
                      style={[
                        styles.rank,
                        isTop3 && styles.topRank,
                        isTop3 && { color: rankColor },
                      ]}
                    >
                      {i + 1}
                    </Text>
                    <Avatar uri={row.avatar_url} name={row.full_name} size={32} />
                    <View style={styles.rowBody}>
                      <Text
                        variant="bodyM"
                        numberOfLines={1}
                        color={isMe ? theme.textColors.matooke[700] : undefined}
                      >
                        {row.full_name}
                        {isMe ? ' (you)' : ''}
                      </Text>
                      <Text variant="bodyS" color={theme.semantic.text.secondary} tabular>
                        {row.run_count} {row.run_count === 1 ? 'run' : 'runs'}
                      </Text>
                    </View>
                    <Text
                      variant="mono"
                      tabular
                      style={isMe ? styles.myDistance : undefined}
                    >
                      {formatLeaderboardDistance(row.total_distance_m)}
                    </Text>
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
  sub: { marginTop: theme.spacing.xs },
  gapLg: { height: theme.spacing.lg },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  tableHead: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  rankHead: { width: 32 },
  nameHead: { flex: 1 },
  distHead: { minWidth: 80, textAlign: 'right' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
    minHeight: 64,
  },
  rowMe: { backgroundColor: theme.fills.matooke[100] },
  rowMeLeftBorder: {
    borderLeftWidth: 3,
    borderLeftColor: theme.fills.matooke[500],
  },
  rank: { width: 24, fontWeight: '500' },
  topRank: { fontWeight: '700' },
  rowBody: { flex: 1 },
  myDistance: { fontWeight: '600' },
});