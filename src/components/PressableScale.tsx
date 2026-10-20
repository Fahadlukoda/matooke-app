import React, { useCallback } from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PressableProps & {
  children: React.ReactNode;
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
};

export function PressableScale({
  children,
  scaleTo = 0.98,
  style,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: any) => {
      if (!disabled) {
        scale.value = withTiming(scaleTo, {
          duration: theme.motion.duration.fast,
          easing: theme.motion.easing.standard,
        });
      }
      onPressIn?.(e);
    },
    [scale, scaleTo, disabled, onPressIn]
  );

  const handlePressOut = useCallback(
    (e: any) => {
      if (!disabled) {
        scale.value = withTiming(1, {
          duration: theme.motion.duration.fast,
          easing: theme.motion.easing.standard,
        });
      }
      onPressOut?.(e);
    },
    [scale, disabled, onPressOut]
  );

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[style, animStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}