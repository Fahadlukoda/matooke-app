import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Text } from './Text';

type Variant = 'neutral' | 'success' | 'warning' | 'danger' | 'gold' | 'role';
type Size = 'sm' | 'md';

type Props = {
  label: string;
  variant?: Variant;
  size?: Size;
  style?: StyleProp<ViewStyle>;
};

export function Badge({ label, variant = 'neutral', size = 'md', style }: Props) {
  const { bg, fg } = colorsFor(variant);
  const sizing = size === 'sm'
    ? { px: theme.spacing.xs, py: 2, text: 'caption' as const }
    : { px: theme.spacing.sm, py: theme.spacing.xxs, text: 'bodyS' as const };

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: bg,
          paddingHorizontal: sizing.px,
          paddingVertical: sizing.py,
        },
        style,
      ]}
    >
      <Text variant={sizing.text} color={fg}>
        {label}
      </Text>
    </View>
  );
}

function colorsFor(variant: Variant) {
  switch (variant) {
    case 'neutral':
      return { bg: theme.fills.matooke[200], fg: theme.textColors.ink[700] };
    case 'success':
      return { bg: theme.fills.matooke[500], fg: theme.textColors.paper };
    case 'warning':
      return { bg: theme.fills.gold[400], fg: theme.textColors.ink[900] };
    case 'danger':
      return { bg: theme.fills.clay[500], fg: theme.textColors.paper };
    case 'gold':
      return { bg: theme.fills.gold[500], fg: theme.textColors.ink[900] };
    case 'role':
      return { bg: theme.fills.matooke[700], fg: theme.textColors.paper };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radii.badge,
    alignSelf: 'flex-start',
  },
});