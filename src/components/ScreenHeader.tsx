import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';

import { theme } from '@/theme';
import { Text } from './Text';

type Props = {
  title: string;
  onBack?: () => void;
  trailing?: React.ReactNode;
};

export function ScreenHeader({ title, onBack, trailing }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={styles.backButton}
            hitSlop={8}
          >
            <ChevronLeft size={24} color={theme.textColors.ink[900]} strokeWidth={2.25} />
          </Pressable>
        ) : null}
      </View>
      <Text variant="displayM" numberOfLines={1} style={styles.title}>
        {title}
      </Text>
      <View style={styles.right}>{trailing}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    height: 56,
  },
  left: { width: 44, alignItems: 'flex-start' },
  right: { width: 44, alignItems: 'flex-end' },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, textAlign: 'center' },
});