import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@/theme';

type Props = {
  step: 1 | 2 | 3 | 4;
  total?: number;
};

export function OnboardingProgress({ step, total = 4 }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const active = i < step;
        return (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: active
                  ? theme.fills.matooke[500]
                  : theme.fills.matooke[200],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});