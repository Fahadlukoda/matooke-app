import React from 'react';
import { View, StyleSheet } from 'react-native';

import { theme } from '@/theme';
import { Text } from './Text';
import { ordinal, formatResultTime, formatPace } from '@/lib/results';

type Props = {
  position: number | null;
  name: string;
  time: number;
  pace: number | null;
  isMe?: boolean;
};

export function ResultRow({ position, name, time, pace, isMe = false }: Props) {
  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={styles.posCell}>
        <Text variant="bodyM" tabular color={isMe ? theme.textColors.matooke[700] : undefined}>
          {ordinal(position)}
        </Text>
      </View>
      <View style={styles.nameCell}>
        <Text
          variant="bodyM"
          numberOfLines={1}
          color={isMe ? theme.textColors.matooke[700] : undefined}
        >
          {name}
        </Text>
      </View>
      <View style={styles.timeCell}>
        <Text
          variant="mono"
          tabular
          color={isMe ? theme.textColors.matooke[700] : undefined}
        >
          {formatResultTime(time)}
        </Text>
      </View>
      <View style={styles.paceCell}>
        <Text
          variant="bodyS"
          tabular
          color={isMe ? theme.textColors.matooke[700] : theme.semantic.text.secondary}
        >
          {formatPace(pace)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    minHeight: 56,
  },
  rowMe: {
    backgroundColor: theme.fills.matooke[100],
  },
  posCell: { width: 44 },
  nameCell: { flex: 1 },
  timeCell: { width: 76, alignItems: 'flex-end' },
  paceCell: { width: 56, alignItems: 'flex-end', marginLeft: theme.spacing.sm },
});