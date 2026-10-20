import React from 'react';
import { StyleProp, ViewStyle, Pressable } from 'react-native';
import { theme } from '@/theme';
import { Surface } from './Surface';

type Props = {
  children?: React.ReactNode;
  onPress?: () => void;
  padding?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, onPress, padding = theme.spacing.lg, radius, style }: Props) {
  if (!onPress) {
    return (
      <Surface elevation="raised" padding={padding} radius={radius} style={style}>
        {children}
      </Surface>
    );
  }
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {({ pressed }) => (
        <Surface
          elevation="raised"
          padding={padding}
          radius={radius}
          style={[
            pressed && {
              transform: [{ translateY: theme.motion.lift.translateY }],
            },
            style,
          ]}
        >
          {children}
        </Surface>
      )}
    </Pressable>
  );
}