import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ChevronRight, Footprints } from 'lucide-react-native';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { RunMapTrace } from '@/components/RunMapTrace';
import { formatDistanceKm, formatDuration, formatPace } from '@/hooks/useRun';
import type { Run } from '@/lib/runs';

type Props = {
  run: Run;
  accessibilityLabel: string;
  onPress: () => void;
};

export function RunHistoryRow({ run, accessibilityLabel, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <Card padding={theme.spacing.md} radius={theme.radii.card} style={styles.card}>
        <View style={styles.row}>
          <View style={styles.map}>
            {run.route && run.route.length >= 2 ? (
              <RunMapTrace
                route={run.route}
                width={56}
                height={56}
                strokeColor={theme.fills.matooke[500]}
                strokeWidth={2}
                style={styles.trace}
              />
            ) : (
              <Footprints
                size={22}
                color={theme.textColors.matooke[700]}
                strokeWidth={2}
              />
            )}
          </View>

          <View style={styles.info}>
            <Text variant="bodyS" tabular>
              {formatDistanceKm(run.distance_m)} km
            </Text>
            <Text
              variant="caption"
              color={theme.semantic.text.secondary}
              tabular
              numberOfLines={1}
              style={styles.meta}
            >
              {formatDuration(run.duration_s * 1000)}
              {run.avg_pace_s
                ? ` · ${formatPace(run.avg_pace_s)}/km`
                : ''}
            </Text>
          </View>

          <ChevronRight
            size={18}
            color={theme.textColors.ink[300]}
            strokeWidth={2}
          />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.9 },
  card: {
    backgroundColor: theme.fills.paper,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  map: {
    width: 56,
    height: 56,
    borderRadius: theme.radii.row,
    overflow: 'hidden',
    backgroundColor: theme.fills.matooke[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  trace: {
    borderRadius: theme.radii.row,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  meta: {
    marginTop: theme.spacing.xxs,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
