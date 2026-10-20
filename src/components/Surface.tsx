import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/theme';

type Elevation = 'flat' | 'raised' | 'raisedLg' | 'inset' | 'raisedOnRaised';

type Props = {
  children?: React.ReactNode;
  elevation?: Elevation;
  radius?: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  background?: string;
};

export function Surface({
  children,
  elevation = 'flat',
  radius = theme.radii.card,
  padding,
  style,
  background,
}: Props) {
  const bg =
    background ??
    (elevation === 'raised' || elevation === 'raisedLg' || elevation === 'raisedOnRaised'
      ? theme.semantic.bg.raised
      : theme.semantic.bg.page);

  const shadowStyle: ViewStyle =
    elevation === 'raised'
      ? theme.shadows.raised
      : elevation === 'raisedLg'
      ? theme.shadows.raisedLg
      : elevation === 'raisedOnRaised'
      ? theme.shadows.raisedOnRaised
      : {};

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: radius,
          padding,
        },
        shadowStyle,
        style,
      ]}
    >
      {children}
    </View>
  );
}