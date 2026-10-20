import React from 'react';
import { View, StyleSheet } from 'react-native';

import { theme } from '@/theme';
import { Text } from './Text';
import type { GPSPoint } from '@/lib/run-store';

type Props = {
  route: GPSPoint[];
  followUser?: boolean;
  style?: object;
  strokeColor?: string;
};

export function LiveRouteMap({ route, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Text variant="bodyS" color={theme.semantic.text.secondary} align="center">
        Map preview unavailable on web
      </Text>
      {route.length > 0 ? (
        <Text
          variant="caption"
          color={theme.semantic.text.tertiary}
          align="center"
          style={styles.note}
        >
          {route.length} GPS points recorded
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.fills.matooke[100],
  },
  note: {
    marginTop: theme.spacing.xs,
  },
});