import React, { useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

import { theme } from '@/theme';
import { Text } from './Text';
import type { Event } from '@/lib/events';

type Props = {
  events: Event[];
  selectedDate: string | null;
  onSelectDate: (iso: string | null) => void;
};

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfMonthGrid(d: Date): Date {
  const first = new Date(d.getFullYear(), d.getMonth(), 1);
  const dow = (first.getDay() + 6) % 7;
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - dow);
  return gridStart;
}

export function CalendarGrid({ events, selectedDate, onSelectDate }: Props) {
  const [cursor, setCursor] = useState(() => new Date());

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const event of events) {
      const key = toISO(new Date(event.start_at));
      const list = map.get(key) ?? [];
      list.push(event);
      map.set(key, list);
    }
    return map;
  }, [events]);

  const grid = useMemo(() => {
    const start = startOfMonthGrid(cursor);
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  function prevMonth() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Pressable
          onPress={prevMonth}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          hitSlop={8}
          style={styles.navBtn}
        >
          <ChevronLeft size={20} color={theme.textColors.ink[700]} strokeWidth={2.25} />
        </Pressable>
        <Text variant="bodyL">{monthLabel}</Text>
        <Pressable
          onPress={nextMonth}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          hitSlop={8}
          style={styles.navBtn}
        >
          <ChevronRight size={20} color={theme.textColors.ink[700]} strokeWidth={2.25} />
        </Pressable>
      </View>

      <View style={styles.weekdays}>
        {WEEKDAYS.map((d, i) => (
          <View key={i} style={styles.weekdayCell}>
            <Text variant="caption" color={theme.semantic.text.secondary} align="center">
              {d}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((day) => {
          const iso = toISO(day);
          const inMonth = day.getMonth() === cursor.getMonth();
          const dayEvents = eventsByDay.get(iso) ?? [];
          const hasEvent = dayEvents.length > 0;
          const isSelected = selectedDate === iso;
          const isToday = toISO(new Date()) === iso;

          return (
            <Pressable
              key={iso}
              onPress={() => onSelectDate(isSelected ? null : iso)}
              accessibilityRole="button"
              accessibilityLabel={`${iso}${hasEvent ? `, ${dayEvents.length} events` : ''}`}
              style={styles.dayCell}
            >
              <View
                style={[
                  styles.dayInner,
                  isSelected && {
                    backgroundColor: theme.fills.matooke[500],
                  },
                  !isSelected && isToday && {
                    borderWidth: 1,
                    borderColor: theme.fills.matooke[500],
                  },
                ]}
              >
                <Text
                  variant="bodyS"
                  tabular
                  color={
                    isSelected
                      ? theme.textColors.paper
                      : inMonth
                      ? theme.semantic.text.primary
                      : theme.semantic.text.tertiary
                  }
                >
                  {day.getDate()}
                </Text>
                {hasEvent ? (
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: isSelected
                          ? theme.fills.paper
                          : theme.fills.matooke[500],
                      },
                    ]}
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.fills.matooke[100],
    borderRadius: theme.radii.card,
    padding: theme.spacing.md,
    ...theme.shadows.raised,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdays: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xs,
  },
  weekdayCell: { width: `${100 / 7}%` },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayInner: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
});