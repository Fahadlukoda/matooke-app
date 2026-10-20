import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Text } from './Text';
import { InsetSurface } from './InsetSurface';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Chip({ label, selected = false, onPress, disabled = false, style }: Props) {
  if (selected) {
    return (
      <InsetSurface
        radius={theme.radii.chip}
        padding={0}
        style={[{ alignSelf: 'flex-start' }, style]}
      >
        <Pressable
          onPress={onPress}
          disabled={disabled}
          style={styles.inner}
          accessibilityRole="button"
          accessibilityState={{ selected, disabled }}
        >
          <Text variant="bodyS" color={theme.textColors.matooke[700]}>
            {label}
          </Text>
        </Pressable>
      </InsetSurface>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={[
        styles.inner,
        styles.unselected,
        { backgroundColor: theme.fills.matooke[100] },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text variant="bodyS" color={theme.textColors.ink[700]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselected: {
    borderRadius: theme.radii.chip,
  },
});