import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { theme } from '@/theme';
import type { GPSPoint } from '@/lib/run-store';

type Props = {
  route: GPSPoint[];
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

type MappedPoint = { x: number; y: number };

export function RunMapTrace({
  route,
  width = 200,
  height = 120,
  strokeColor = theme.fills.matooke[500],
  strokeWidth = 3,
  style,
}: Props) {
  const mapped: MappedPoint[] = useMemo(() => {
    if (!route || route.length < 2) return [];

    const first = route[0];
    const last = route[route.length - 1];
    if (!first || !last) return [];

    let minLat = first.lat;
    let maxLat = first.lat;
    let minLng = first.lng;
    let maxLng = first.lng;

    for (const p of route) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    }

    const latRange = Math.max(maxLat - minLat, 0.00001);
    const lngRange = Math.max(maxLng - minLng, 0.00001);

    const padding = 10;
    const drawWidth = width - padding * 2;
    const drawHeight = height - padding * 2;

    const result: MappedPoint[] = [];
    for (const p of route) {
      const x = padding + ((p.lng - minLng) / lngRange) * drawWidth;
      const y = padding + (1 - (p.lat - minLat) / latRange) * drawHeight;
      result.push({ x, y });
    }
    return result;
  }, [route, width, height]);

  if (mapped.length === 0) {
    return <View style={[{ width, height }, styles.empty, style]} />;
  }

  const pointsString = mapped
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  const start = mapped[0]!;
  const end = mapped[mapped.length - 1]!;

  return (
    <View style={[{ width, height }, style]}>
      <Svg width={width} height={height}>
        <Polyline
          points={pointsString}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle
          cx={start.x}
          cy={start.y}
          r={4}
          fill={theme.fills.paper}
          stroke={strokeColor}
          strokeWidth={2}
        />
        <Circle
          cx={end.x}
          cy={end.y}
          r={4}
          fill={strokeColor}
          stroke={theme.fills.paper}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: theme.fills.matooke[200],
    borderRadius: theme.radii.badge,
  },
});