import React from 'react';
import { Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { HandMetal } from 'lucide-react-native';

import { theme } from '@/theme';
import { Text } from './Text';

type Props = {
  count: number;
  active: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function ReactionButton({ count, active, onPress, disabled, style }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remove reaction' : 'React'}
      accessibilityState={{ selected: active, disabled }}
      hitSlop={8}
      style={[styles.wrap, style]}
    >
      <HandMetal
        size={18}
        color={active ? theme.textColors.gold[600] : theme.textColors.ink[500]}
        strokeWidth={2}
        fill={active ? theme.fills.gold[400] : 'none'}
      />
      {count > 0 ? (
        <Text
          variant="bodyS"
          color={active ? theme.semantic.text.gold : theme.semantic.text.secondary}
          tabular
        >
          {count}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    minHeight: 36,
  },
});