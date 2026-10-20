import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Play } from 'lucide-react-native';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { useTopInset } from '@/lib/insets';

export function RunReadyHeader() {
  const topInset = useTopInset();

  return (
    <View style={[styles.container, { paddingTop: topInset + theme.spacing.md }]}>
      <View style={styles.titleRow}>
        <Text variant="displayM">Ready to run</Text>
        <Play
          size={24}
          color={theme.textColors.ink[900]}
          strokeWidth={2}
        />
      </View>
      <Text
        variant="bodyM"
        color={theme.semantic.text.secondary}
        style={styles.subtitle}
      >
        GPS is warming up. We'll start the moment you tap.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: theme.semantic.bg.page,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
  },
});
