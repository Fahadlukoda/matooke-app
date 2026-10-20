import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';

type Props = {
  inset?: number;
  style?: StyleProp<ViewStyle>;
};

export function Divider({ inset = 0, style }: Props) {
  return (
    <View
      style={[
        {
          height: 1,
          backgroundColor: theme.fills.matooke[200],
          marginHorizontal: inset,
        },
        style,
      ]}
    />
  );
}