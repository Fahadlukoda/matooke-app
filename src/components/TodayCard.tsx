import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Flame, Footprints, Timer } from 'lucide-react-native';

import { theme } from '@/theme';
import { formatDistanceKm, formatDuration, formatPace } from '@/hooks/useRun';
import type { Run } from '@/lib/runs';
import { Card } from './Card';
import { RunMapTrace } from './RunMapTrace';
import { Text } from './Text';

type Props = {
  todayRun: Run | null;
  dailySteps: number;
  dailyCalories: number;
  stepGoal?: number;
};

const RING_SIZE = 96;
const RING_STROKE_WIDTH = 8;
const RING_RADIUS = (RING_SIZE - RING_STROKE_WIDTH) / 2;
const RING_CIRCUMFERENCE = RING_RADIUS * 2 * Math.PI;

export function TodayCard({
  todayRun,
  dailySteps,
  dailyCalories,
  stepGoal = 10000,
}: Props) {
  const [mapWidth, setMapWidth] = useState(0);
  const progress = Math.min(dailySteps / stepGoal, 1);
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);
  const route = todayRun?.route;

  return (
    <Card style={{ padding: theme.spacing.lg }}>
      <View style={styles.headerRow}>
        <Text variant="bodyL" style={styles.title}>
          Today
        </Text>
        <Text variant="caption" color={theme.semantic.text.secondary}>
          {dailySteps.toLocaleString()} STEPS
        </Text>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.ringContainer}>
          <View style={styles.ringWrap}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={theme.fills.matooke[200]}
                strokeWidth={RING_STROKE_WIDTH}
                fill="none"
              />
              <Circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                stroke={theme.fills.matooke[500]}
                strokeWidth={RING_STROKE_WIDTH}
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
                transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
              />
            </Svg>
            <View style={styles.ringIcon}>
              <Footprints size={16} color={theme.textColors.matooke[700]} />
            </View>
          </View>

          <View style={styles.calorieRow}>
            <Flame size={14} color={theme.fills.clay[500]} />
            <Text variant="bodyS">{dailyCalories} kcal</Text>
          </View>
        </View>

        <View style={styles.runColumn}>
          {route && route.length >= 2 && todayRun ? (
            <>
              <View
                style={styles.map}
                onLayout={(event) => setMapWidth(event.nativeEvent.layout.width)}
              >
                {mapWidth > 0 ? (
                  <RunMapTrace
                    route={route}
                    width={mapWidth}
                    height={80}
                    strokeColor={theme.fills.matooke[500]}
                    strokeWidth={3}
                  />
                ) : null}
              </View>
              <View style={styles.statsRow}>
                <Text variant="bodyS" tabular>
                  {formatDistanceKm(todayRun.distance_m)} km
                </Text>
                <View style={styles.duration}>
                  <Timer size={12} color={theme.textColors.ink[500]} />
                  <Text variant="bodyS" tabular>
                    {formatDuration(todayRun.duration_s * 1000)}
                  </Text>
                </View>
                {todayRun.avg_pace_s != null ? (
                  <View style={styles.pace}>
                    <Timer size={12} color={theme.textColors.ink[500]} />
                    <Text variant="bodyS" tabular>
                      {formatPace(todayRun.avg_pace_s)} /km
                    </Text>
                  </View>
                ) : null}
              </View>
            </>
          ) : (
            <View style={styles.restDay}>
              <Text
                variant="bodyS"
                color={theme.semantic.text.secondary}
                align="center"
              >
                Rest day. No runs logged yet today.
              </Text>
            </View>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontWeight: '600',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  ringContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  ringIcon: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  runColumn: {
    flex: 1,
  },
  map: {
    height: 80,
    borderRadius: theme.radii.row,
    overflow: 'hidden',
    backgroundColor: theme.fills.matooke[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xs,
  },
  duration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  restDay: {
    height: 100,
    justifyContent: 'center',
    backgroundColor: theme.fills.matooke[100],
    borderRadius: theme.radii.row,
    padding: theme.spacing.md,
  },
});
