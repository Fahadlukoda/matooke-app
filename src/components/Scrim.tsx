import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Position = 'bottom' | 'top' | 'full';

type Props = {
  position?: Position;
  height?: number | `${number}%`;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
};

export function Scrim({ position = 'bottom', height = '60%', intensity = 0.7, style }: Props) {
  const colors =
    position === 'top'
      ? ([
          `rgba(23,24,26,${intensity})`,
          'rgba(23,24,26,0)',
        ] as const)
      : position === 'full'
      ? ([
          `rgba(23,24,26,${intensity * 0.4})`,
          `rgba(23,24,26,${intensity * 0.6})`,
          `rgba(23,24,26,${intensity})`,
        ] as const)
      : ([
          'rgba(23,24,26,0)',
          `rgba(23,24,26,${intensity * 0.5})`,
          `rgba(23,24,26,${intensity})`,
        ] as const);

  const locations =
    position === 'top'
      ? ([0, 1] as const)
      : position === 'full'
      ? ([0, 0.5, 1] as const)
      : ([0, 0.5, 1] as const);

  const anchor =
    position === 'top'
      ? { top: 0, left: 0, right: 0, height }
      : { bottom: 0, left: 0, right: 0, height };

  return (
    <LinearGradient
      colors={colors}
      locations={locations}
      style={[anchor, styles.abs, style]}
      pointerEvents="none"
    />
  );
}

const styles = StyleSheet.create({
  abs: {
    position: 'absolute',
  },
});