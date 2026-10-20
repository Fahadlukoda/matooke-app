import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Text } from './Text';

type Cell = {
  label: string;
  value: string;
};

type Props = {
  cells: Cell[];
  columns?: 1 | 2 | 3 | 4;
  style?: StyleProp<ViewStyle>;
};

export function StatGrid({ cells, columns = 2, style }: Props) {
  return (
    <View style={[styles.grid, style]}>
      {cells.map((cell, i) => {
        const isLastInRow = (i + 1) % columns === 0;
        const isLast = i === cells.length - 1;
        return (
          <View
            key={`${cell.label}-${i}`}
            style={[
              styles.cell,
              {
                width: `${100 / columns}%`,
                borderRightWidth: !isLastInRow && !isLast ? 1 : 0,
                borderRightColor: theme.fills.matooke[200],
              },
            ]}
          >
            <Text variant="caption" color={theme.semantic.text.secondary} align="center">
              {cell.label}
            </Text>
            <Text
              variant="mono"
              color={theme.semantic.text.primary}
              align="center"
              tabular
              style={styles.value}
            >
              {cell.value}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    marginTop: theme.spacing.xxs,
    fontSize: 18,
  },
});