import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'hero';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  style,
}: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = useCallback(() => {
    scale.value = withTiming(theme.motion.press.scale, {
      duration: theme.motion.duration.fast,
      easing: theme.motion.easing.standard,
    });
  }, [scale]);

  const onPressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: theme.motion.duration.fast,
      easing: theme.motion.easing.standard,
    });
  }, [scale]);

  const { bg, fg, border } = getColors(variant, disabled);
  const sizing = getSizing(size);
  const isInert = disabled || loading;

  return (
    <AnimatedPressable
      onPress={isInert ? undefined : onPress}
      onPressIn={isInert ? undefined : onPressIn}
      onPressOut={isInert ? undefined : onPressOut}
      disabled={isInert}
      style={[
        animStyle,
        styles.base,
        {
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'ghost' ? 0 : border ? 1 : 0,
          paddingHorizontal: sizing.px,
          height: sizing.h,
          borderRadius: theme.radii.button,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled && !loading ? 0.55 : 1,
        },
        !disabled && variant !== 'ghost' ? theme.shadows.raised : null,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isInert, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={fg} size="small" />
      ) : (
        <View style={styles.content}>
          {leadingIcon ? <View style={styles.icon}>{leadingIcon}</View> : null}
          <Text variant={sizing.text} color={fg}>
            {label}
          </Text>
          {trailingIcon ? <View style={styles.icon}>{trailingIcon}</View> : null}
        </View>
      )}
    </AnimatedPressable>
  );
}

function getColors(variant: Variant, disabled: boolean) {
  if (disabled) {
    return {
      bg: theme.fills.matooke[200],
      fg: theme.textColors.ink[500],
      border: undefined,
    };
  }
  switch (variant) {
    case 'primary':
      return {
        bg: theme.fills.matooke[500],
        fg: theme.textColors.paper,
        border: undefined,
      };
    case 'hero':
      return {
        bg: '#2D9B4B',
        fg: theme.textColors.paper,
        border: undefined,
      };
    case 'secondary':
      return {
        bg: theme.fills.matooke[100],
        fg: theme.textColors.ink[900],
        border: theme.fills.matooke[200],
      };
    case 'ghost':
      return {
        bg: theme.fills.transparent,
        fg: theme.textColors.matooke[700],
        border: undefined,
      };
    case 'danger':
      return {
        bg: theme.fills.clay[500],
        fg: theme.textColors.paper,
        border: undefined,
      };
    case 'gold':
      return {
        bg: theme.fills.gold[500],
        fg: theme.textColors.ink[900],
        border: undefined,
      };
  }
}

function getSizing(size: Size) {
  switch (size) {
    case 'sm':
      return { h: 36, px: 14, text: 'bodyS' as const };
    case 'md':
      return { h: 48, px: 20, text: 'bodyM' as const };
    case 'lg':
      return { h: 56, px: 24, text: 'bodyL' as const };
  }
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginHorizontal: 4,
  },
});