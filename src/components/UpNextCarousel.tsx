import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  View,
} from 'react-native';

import { theme } from '@/theme';
import { HeroEventCard } from './HeroEventCard';
import type { Event } from '@/lib/events';

const CARD_WIDTH = Dimensions.get('window').width - theme.spacing.lg * 2;
const SPACING = theme.spacing.md;
const AUTO_SCROLL_INTERVAL = 4000;
const RESUME_DELAY = 2000;

type Props = {
  events: Event[];
  onPressEvent: (event: Event) => void;
};

export function UpNextCarousel({ events, onPressEvent }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<Event>>(null);
  const isDragging = useRef(false);
  const resumeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, Math.max(events.length - 1, 0)));
  }, [events.length]);

  useEffect(() => {
    if (events.length < 2) return;

    const interval = setInterval(() => {
      if (isDragging.current) return;

      const nextIndex = (activeIndex + 1) % events.length;
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [activeIndex, events.length]);

  useEffect(
    () => () => {
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    },
    []
  );

  function onMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING)
    );
    setActiveIndex(Math.max(0, Math.min(index, events.length - 1)));
  }

  function onScrollBeginDrag() {
    isDragging.current = true;
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
  }

  function onScrollEndDrag() {
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => {
      isDragging.current = false;
      resumeTimeout.current = null;
    }, RESUME_DELAY);
  }

  if (events.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={events}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + SPACING,
          offset: (CARD_WIDTH + SPACING) * index,
          index,
        })}
        renderItem={({ item }) => (
          <HeroEventCard
            event={item}
            onPress={() => onPressEvent(item)}
            style={styles.card}
          />
        )}
      />

      <View style={styles.pagination}>
        {events.map((event, index) => (
          <View
            key={event.id}
            style={[
              styles.dot,
              index === activeIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -theme.spacing.lg,
  },
  listContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  card: {
    width: CARD_WIDTH,
  },
  separator: {
    width: SPACING,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 18,
    backgroundColor: theme.fills.matooke[500],
  },
  inactiveDot: {
    width: 6,
    backgroundColor: theme.fills.matooke[300],
  },
});