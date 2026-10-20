import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/theme';

type Variant = 'gradient' | 'border';

type Props = {
  children?: React.ReactNode;
  variant?: Variant;
  radius?: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
};

const fill = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export function InsetSurface({
  children,
  variant = 'gradient',
  radius = theme.radii.input,
  padding,
  style,
}: Props) {
  if (variant === 'border') {
    return (
      <View
        style={[
          styles.base,
          {
            borderRadius: radius,
            borderTopColor: 'rgba(196, 203, 175, 0.55)',
            borderLeftColor: 'rgba(196, 203, 175, 0.55)',
            borderBottomColor: 'rgba(255, 255, 255, 0.85)',
            borderRightColor: 'rgba(255, 255, 255, 0.85)',
            borderWidth: 1,
            padding,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[{ borderRadius: radius, overflow: 'hidden' }, style]}>
      <View
        pointerEvents="none"
        style={[
          fill,
          {
            backgroundColor: 'rgba(255,255,255,0.6)',
            borderRadius: radius,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[fill, styles.darkTopLeft, { borderRadius: radius }]}
      />
      <View
        pointerEvents="none"
        style={[fill, styles.lightBottomRight, { borderRadius: radius }]}
      />
      <View style={[{ padding }, styles.content]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: theme.semantic.bg.inset,
  },
  content: {
    position: 'relative',
  },
  darkTopLeft: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderTopColor: 'rgba(196, 203, 175, 0.75)',
    borderLeftColor: 'rgba(196, 203, 175, 0.75)',
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
  },
  lightBottomRight: {
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.95)',
    borderRightColor: 'rgba(255, 255, 255, 0.95)',
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
  },
});