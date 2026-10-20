import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Text } from './Text';

type Segment = {
  label: string;
  weight: number;
};

type Props = {
  segments: Segment[];
  value: number;
  valueLabel?: string;
  style?: StyleProp<ViewStyle>;
};

export function ProgressScale({ segments, value, valueLabel, style }: Props) {
  const total = segments.reduce((acc, s) => acc + s.weight, 0);
  const clamped = Math.max(0, Math.min(1, value));

  return (
    <View style={style}>
      <View style={styles.track}>
        {segments.map((seg, i) => {
          const widthPct = (seg.weight / total) * 100;
          const color = pickSegmentColor(i, segments.length);
          return (
            <View
              key={seg.label}
              style={{
                width: `${widthPct}%`,
                height: '100%',
                backgroundColor: color,
                borderTopLeftRadius: i === 0 ? 4 : 0,
                borderBottomLeftRadius: i === 0 ? 4 : 0,
                borderTopRightRadius: i === segments.length - 1 ? 4 : 0,
                borderBottomRightRadius: i === segments.length - 1 ? 4 : 0,
              }}
            />
          );
        })}
        <View
          pointerEvents="none"
          style={[
            styles.marker,
            {
              left: `${clamped * 100}%`,
              transform: [{ translateX: -8 }],
            },
          ]}
        />
      </View>
      {valueLabel ? (
        <Text
          variant="caption"
          color={theme.semantic.text.secondary}
          align="center"
          style={styles.valueLabel}
        >
          {valueLabel}
        </Text>
      ) : null}
    </View>
  );
}

function pickSegmentColor(i: number, total: number): string {
  if (total === 5) {
    const palette = [
      theme.fills.matooke[300],
      theme.fills.matooke[400],
      theme.fills.matooke[500],
      theme.fills.gold[400],
      theme.fills.clay[500],
    ];
    return palette[i] ?? theme.fills.matooke[300];
  }
  return theme.fills.matooke[400];
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'visible',
    backgroundColor: theme.fills.matooke[200],
  },
  marker: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.fills.paper,
    borderWidth: 2,
    borderColor: theme.fills.matooke[700],
  },
  valueLabel: {
    marginTop: theme.spacing.xs,
  },
});