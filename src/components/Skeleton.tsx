import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '@/theme';

type Variant = 'text' | 'card' | 'listRow' | 'statTile' | 'map';

type Props = {
  variant?: Variant;
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ variant = 'text', width, height, radius, style }: Props) {
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const preset = presets[variant];
  const resolvedWidth = width ?? preset.width;
  const resolvedHeight = height ?? preset.height;
  const resolvedRadius = radius ?? preset.radius;

  if (variant === 'listRow') {
    return (
      <Animated.View
        style={[styles.rowWrap, animStyle, style]}
        accessibilityLabel="Loading"
      >
        <View style={[styles.rowAvatar, { backgroundColor: theme.fills.matooke[200] }]} />
        <View style={styles.rowBody}>
          <View
            style={{
              backgroundColor: theme.fills.matooke[200],
              borderRadius: theme.radii.badge,
              height: 12,
              width: '70%',
            }}
          />
          <View
            style={{
              backgroundColor: theme.fills.matooke[200],
              borderRadius: theme.radii.badge,
              height: 10,
              width: '45%',
              marginTop: 8,
            }}
          />
        </View>
      </Animated.View>
    );
  }

  if (variant === 'card') {
    return (
      <Animated.View
        style={[
          {
            backgroundColor: theme.fills.matooke[100],
            borderRadius: theme.radii.card,
            padding: theme.spacing.lg,
          },
          animStyle,
          style,
        ]}
        accessibilityLabel="Loading"
      >
        <View
          style={{
            backgroundColor: theme.fills.matooke[200],
            borderRadius: theme.radii.badge,
            height: 14,
            width: '60%',
          }}
        />
        <View
          style={{
            backgroundColor: theme.fills.matooke[200],
            borderRadius: theme.radii.badge,
            height: 12,
            width: '90%',
            marginTop: 12,
          }}
        />
        <View
          style={{
            backgroundColor: theme.fills.matooke[200],
            borderRadius: theme.radii.badge,
            height: 12,
            width: '40%',
            marginTop: 8,
          }}
        />
      </Animated.View>
    );
  }

  if (variant === 'statTile') {
    return (
      <Animated.View style={[styles.statTile, animStyle, style]} accessibilityLabel="Loading">
        <View
          style={{
            backgroundColor: theme.fills.matooke[200],
            height: 10,
            width: '50%',
            borderRadius: theme.radii.badge,
          }}
        />
        <View
          style={{
            backgroundColor: theme.fills.matooke[200],
            height: 22,
            width: '70%',
            borderRadius: theme.radii.badge,
            marginTop: 10,
          }}
        />
      </Animated.View>
    );
  }

  if (variant === 'map') {
    return (
      <Animated.View
        accessibilityLabel="Loading map"
        style={[
          {
            backgroundColor: theme.fills.matooke[200],
            borderRadius: theme.radii.card,
            width: resolvedWidth,
            height: resolvedHeight,
          },
          animStyle,
          style,
        ]}
      />
    );
  }

  return (
    <Animated.View
      accessibilityLabel="Loading"
      style={[
        {
          backgroundColor: theme.fills.matooke[200],
          width: resolvedWidth,
          height: resolvedHeight,
          borderRadius: resolvedRadius,
        },
        animStyle,
        style,
      ]}
    />
  );
}

const presets: Record<Variant, { width: number | `${number}%`; height: number; radius: number }> = {
  text: { width: '80%', height: 14, radius: theme.radii.badge },
  card: { width: '100%', height: 96, radius: theme.radii.card },
  listRow: { width: '100%', height: 56, radius: theme.radii.row },
  statTile: { width: 120, height: 56, radius: theme.radii.row },
  map: { width: '100%', height: 220, radius: theme.radii.card },
};

const styles = StyleSheet.create({
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing.md,
  },
  rowBody: {
    flex: 1,
  },
  statTile: {
    padding: theme.spacing.md,
    backgroundColor: theme.fills.matooke[100],
    borderRadius: theme.radii.row,
  },
});