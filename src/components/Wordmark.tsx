import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

import { theme } from '@/theme';
import { Text } from './Text';

type Size = 'md' | 'lg';

type Props = {
  size?: Size;
  tagline?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Wordmark({ size = 'md', tagline = false, style }: Props) {
  const variant = size === 'lg' ? 'displayL' : 'displayM';
  const taglineVariant = size === 'lg' ? 'bodyM' : 'bodyS';

  return (
    <View style={[styles.wrap, style]}>
      <Text variant={variant} color={theme.textColors.matooke[700]}>
        Team Matooke
      </Text>
      {tagline ? (
        <Text
          variant={taglineVariant}
          color={theme.semantic.text.secondary}
          style={styles.tagline}
        >
          We Run Kampala
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-start',
  },
  tagline: {
    marginTop: theme.spacing.xxs,
    fontStyle: 'italic',
  },
});