import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ImageBackground,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { theme } from '@/theme';
import { Text } from './Text';
import { Badge } from './Badge';
import { Scrim } from './Scrim';
import { images } from '@/lib/images';
import type { Event } from '@/lib/events';
import { formatEventDate, formatFee } from '@/lib/events';

type Props = {
  event: Event;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function HeroEventCard({ event, onPress, style }: Props) {
  const posterSource = event.poster_url ? { uri: event.poster_url } : images.marathonPoster;
  const fee = formatFee(event.entry_fee_ugx, event.is_paid);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={event.title}
      style={style}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.wrap,
            pressed && { transform: [{ translateY: -2 }] },
          ]}
        >
          <ImageBackground
            source={posterSource}
            style={styles.hero}
            resizeMode="cover"
          >
            <Scrim position="bottom" height="70%" intensity={0.9} />
            <View style={styles.content}>
              <View style={styles.badgeRow}>
                <Badge
                  label={event.type === 'marathon' ? 'Marathon' : 'Training Run'}
                  variant={event.type === 'marathon' ? 'gold' : 'success'}
                  size="sm"
                />
                <Badge label={fee} variant="neutral" size="sm" />
              </View>
              <Text
                variant="displayL"
                color={theme.textColors.paper}
                numberOfLines={2}
                style={styles.title}
              >
                {event.title}
              </Text>
              <Text
                variant="bodyS"
                color="rgba(251,251,247,0.8)"
                tabular
                style={styles.meta}
              >
                {formatEventDate(event.start_at)} · {event.venue_name}
              </Text>
            </View>
          </ImageBackground>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: theme.radii.hero,
    overflow: 'hidden',
    ...theme.shadows.raisedLg,
  },
  hero: {
    minHeight: 230,
    justifyContent: 'flex-end',
    backgroundColor: theme.fills.matooke[200],
  },
  content: {
    padding: theme.spacing.xl,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  meta: {
    marginTop: theme.spacing.xxs,
  },
});