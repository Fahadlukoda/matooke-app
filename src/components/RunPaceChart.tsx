import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';
import { theme } from '@/theme';
import type { GPSPoint } from '@/lib/run-store';

type Props = {
  route: GPSPoint[];
  width?: number;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

export function RunPaceChart({ route, width = 200, height = 60, style }: Props) {
  const points = useMemo(() => {
    if (!route || route.length < 2) return '';

    // Group route into segments (e.g., every 10% of the total distance)
    const segments = 10;
    const segLength = Math.floor(route.length / segments);
    if (segLength < 1) return '';

    const paces: number[] = [];

    for (let i = 0; i < segments; i++) {
      const startIdx = i * segLength;
      const endIdx = Math.min((i + 1) * segLength, route.length - 1);

      const start = route[startIdx];
      const end = route[endIdx];

      if (!start || !end) continue;

      // Calculate distance (approximate using haversine)
      const R = 6371000;
      const dLat = ((end.lat - start.lat) * Math.PI) / 180;
      const dLng = ((end.lng - start.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((start.lat * Math.PI) / 180) *
          Math.cos((end.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const distance = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const time = (end.t - start.t) / 1000;
      if (distance > 5 && time > 0) {
        paces.push(time / distance); // sec per meter
      }
    }

    if (paces.length === 0) return '';

    // Find min and max pace
    const minPace = Math.min(...paces);
    const maxPace = Math.max(...paces);
    const range = Math.max(maxPace - minPace, 0.01);

    // Map to SVG
    return paces
      .map((p, i) => {
        const x = (i / Math.max(paces.length - 1, 1)) * width;
        // Invert Y: faster pace (lower number) = higher on chart
        const y = height - ((p - minPace) / range) * height * 0.8 - height * 0.1;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [route, width, height]);

  return (
    <View style={[{ width, height }, style]}>
      {points ? (
        <Svg width={width} height={height}>
          <Polyline
            points={points}
            fill="none"
            stroke={theme.fills.gold[400]}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({});