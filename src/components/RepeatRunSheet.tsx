import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { formatDistanceKm, formatDuration, formatPace } from '@/hooks/useRun';
import type { Run } from '@/lib/runs';

type Props = {
  run: Run | null;
  visible: boolean;
  onCancel: () => void;
  onStart: () => void;
};

export function RepeatRunSheet({ run, visible, onCancel, onStart }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.modal}>
        <Pressable
          style={styles.backdrop}
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Close repeat run sheet"
        />
        <Card padding={theme.spacing.xl} radius={theme.radii.sheet} style={styles.sheet}>
          <Text variant="bodyL" style={styles.title}>
            Repeat this run?
          </Text>
          <Text variant="bodyS" color={theme.semantic.text.secondary} style={styles.subtitle}>
            Start a new personal run. Compare your pace and time against this one.
          </Text>

          {run ? (
            <View style={styles.stats}>
              <Stat label="Distance" value={`${formatDistanceKm(run.distance_m)} km`} />
              <Stat label="Duration" value={formatDuration(run.duration_s * 1000)} />
              <Stat
                label="Pace"
                value={`${formatPace(run.avg_pace_s ?? 0)}/km`}
              />
            </View>
          ) : null}

          <Button
            label="Start repeat run"
            onPress={onStart}
            variant="hero"
            size="lg"
            fullWidth
            style={styles.start}
          />
          <Button
            label="Cancel"
            onPress={onCancel}
            variant="secondary"
            size="lg"
            fullWidth
          />
        </Card>
      </View>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text variant="caption" color={theme.semantic.text.secondary}>
        {label}
      </Text>
      <Text variant="bodyS" tabular style={styles.statValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(23, 24, 26, 0.4)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    backgroundColor: theme.fills.paper,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    marginTop: theme.spacing.xs,
  },
  stats: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    marginTop: theme.spacing.xs,
  },
  start: {
    marginBottom: theme.spacing.sm,
  },
});
