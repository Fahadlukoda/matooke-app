import React from 'react';
import {
  ImageBackground,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Scrim } from '@/components/Scrim';
import { images } from '@/lib/images';
import type { Event } from '@/lib/events';

type Props = {
  event: Event;
  state: 'registered' | 'open' | 'closed';
  onPressStart: () => void;
  onPressRegister: () => void;
  style?: StyleProp<ViewStyle>;
};

export function TodayEventCard({
  event,
  state,
  onPressStart,
  onPressRegister,
  style,
}: Props) {
  const posterSource = event.poster_url
    ? { uri: event.poster_url }
    : images.marathonPoster;

  return (
    <Card padding={0} radius={theme.radii.card} style={[styles.card, style]}>
      <ImageBackground
        source={posterSource}
        style={styles.poster}
        resizeMode="cover"
      >
        <Scrim position="bottom" height="70%" intensity={0.9} />
        <View style={styles.posterCopy}>
          <Text
            variant="displayM"
            color={theme.textColors.paper}
            numberOfLines={2}
          >
            {event.title}
          </Text>
          <Text
            variant="bodyS"
            color="rgba(251,251,247,0.85)"
            numberOfLines={1}
            style={styles.venue}
          >
            {event.venue_name}
          </Text>
        </View>
      </ImageBackground>

      <View style={styles.footer}>
        {state === 'registered' ? (
          <>
            <Button
              label="Start run"
              onPress={onPressStart}
              variant="hero"
              size="lg"
              fullWidth
            />
            <Text
              variant="bodyS"
              color={theme.semantic.text.secondary}
              style={styles.note}
            >
              Starts your personal tracker. Event results are published by the admin.
            </Text>
          </>
        ) : state === 'open' ? (
          <Button
            label="Register"
            onPress={onPressRegister}
            variant="hero"
            size="lg"
            fullWidth
          />
        ) : (
          <Button
            label="Registration closed"
            onPress={onPressRegister}
            variant="secondary"
            size="lg"
            fullWidth
            disabled
            style={styles.disabledButton}
          />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.fills.paper,
    overflow: 'hidden',
  },
  poster: {
    minHeight: 210,
    justifyContent: 'flex-end',
    backgroundColor: theme.fills.matooke[200],
  },
  posterCopy: {
    padding: theme.spacing.lg,
  },
  venue: {
    marginTop: theme.spacing.xs,
  },
  footer: {
    padding: theme.spacing.md,
  },
  note: {
    marginTop: theme.spacing.sm,
  },
  disabledButton: {
    backgroundColor: theme.fills.matooke[100],
  },
});
