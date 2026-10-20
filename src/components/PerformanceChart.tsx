import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Polyline } from 'react-native-svg';

import { theme } from '@/theme';
import { Text } from './Text';
import type { WeeklyPerformance } from '@/hooks/useWeeklyPerformance';

type Props = {
  data: WeeklyPerformance[];
  width: number;
  height: number;
};

export function PerformanceChart({ data, width, height }: Props) {
  if (data.filter((week) => week.maxDistanceM > 0).length < 2) {
    return (
      <View style={[styles.empty, { width, height }]}>
        <Text
          variant="bodyS"
          color={theme.semantic.text.secondary}
          align="center"
        >
          Finish a few runs and your trend appears here.
        </Text>
      </View>
    );
  }

  const maxDistance = Math.max(...data.map((week) => week.maxDistanceM), 1000);
  const padding = 8;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const points = data.map((week, index) => ({
    x: padding + (index / (data.length - 1)) * chartWidth,
    y:
      padding +
      chartHeight -
      (week.maxDistanceM / maxDistance) * chartHeight,
  }));
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  if (!firstPoint || !lastPoint) return null;

  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPath = [
    `M ${firstPoint.x},${firstPoint.y}`,
    ...points.map((point) => `L ${point.x},${point.y}`),
    `L ${lastPoint.x},${padding + chartHeight}`,
    `L ${firstPoint.x},${padding + chartHeight} Z`,
  ].join(' ');

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Path d={areaPath} fill="rgba(107, 142, 35, 0.15)" />
        <Polyline
          points={polyline}
          fill="none"
          stroke={theme.fills.matooke[600]}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => (
          <Circle
            key={data[index]?.week ?? index}
            cx={point.x}
            cy={point.y}
            r={3}
            fill={theme.fills.matooke[600]}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
});
