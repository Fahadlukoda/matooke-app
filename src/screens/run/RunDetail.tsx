import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Divider } from '@/components/Divider';
import { StatGrid } from '@/components/StatGrid';
import { LiveRouteMap } from '@/components/LiveRouteMap';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useRunById, useUpdateRunVisibility, useDeleteRun } from '@/hooks/useRuns';
import { formatDuration, formatPace, formatDistanceKm } from '@/hooks/useRun';
import { computeCaloriesEstimate } from '@/lib/run-tracker';
import type { RunStackParamList } from '@/navigation/RunStack';

type Props = NativeStackScreenProps<RunStackParamList, 'RunDetail'>;

function confirmAsync(title: string, message: string): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export function RunDetail({ route, navigation }: Props) {
  const { runId } = route.params;
  const runQuery = useRunById(runId);
  const updateVisibility = useUpdateRunVisibility();
  const deleteMutation = useDeleteRun();

  const run = runQuery.data;

  async function onDelete() {
    const ok = await confirmAsync(
      'Delete this run?',
      'This cannot be undone.'
    );
    if (!ok || !run) return;
    await deleteMutation.mutateAsync(run.id);
    navigation.goBack();
  }

  if (runQuery.isLoading || !run) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Run" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          {runQuery.isError ? (
            <Text variant="bodyM" color={theme.semantic.text.danger}>
              Couldn't load run.
            </Text>
          ) : (
            <ActivityIndicator color={theme.fills.matooke[500]} />
          )}
        </View>
      </SafeAreaView>
    );
  }

  const route_points = run.route ?? [];
  const calories = run.calories ?? computeCaloriesEstimate(run.distance_m, run.duration_s * 1000);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Run" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {route_points.length > 0 ? (
          <View style={styles.mapWrap}>
            <LiveRouteMap
              route={route_points}
              style={styles.map}
              strokeColor={theme.textColors.ink[900]}
            />
          </View>
        ) : null}

        <View style={styles.gapLg} />

        <Text variant="displayL" tabular>
          {formatDistanceKm(run.distance_m)} km
        </Text>
        <Text variant="bodyM" color={theme.semantic.text.secondary} style={styles.sub}>
          {new Date(run.started_at).toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        <View style={styles.gapLg} />

        <Card>
          <StatGrid
            columns={2}
            cells={[
              { label: 'Time', value: formatDuration(run.duration_s * 1000) },
              { label: 'Avg pace', value: run.avg_pace_s ? formatPace(run.avg_pace_s) : '—:—' },
              { label: 'Steps', value: run.steps != null ? run.steps.toString() : '—' },
              { label: 'Calories', value: `${calories} kcal` },
            ]}
          />
        </Card>

        <View style={styles.gapLg} />

        <Text variant="caption" color={theme.semantic.text.secondary}>
          Visibility
        </Text>
        <View style={styles.visRow}>
          <Chip
            label="Private"
            selected={run.visibility === 'private'}
            onPress={() =>
              updateVisibility.mutate({ runId: run.id, visibility: 'private' })
            }
            disabled={updateVisibility.isPending}
          />
          <Chip
            label="Share with club"
            selected={run.visibility === 'club'}
            onPress={() =>
              updateVisibility.mutate({ runId: run.id, visibility: 'club' })
            }
            disabled={updateVisibility.isPending}
          />
        </View>

        <View style={styles.gapLg} />

        <Button
          label="Delete run"
          onPress={onDelete}
          variant="ghost"
          size="md"
          fullWidth
          loading={deleteMutation.isPending}
          disabled={deleteMutation.isPending}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing['2xl'] },
  mapWrap: {
    height: 240,
    borderRadius: theme.radii.card,
    overflow: 'hidden',
  },
  map: { flex: 1 },
  gapLg: { height: theme.spacing.xl },
  sub: { marginTop: theme.spacing.xs },
  visRow: { flexDirection: 'row', gap: theme.spacing.xs, marginTop: theme.spacing.sm },
});