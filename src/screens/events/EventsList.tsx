import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CalendarDays,
  List,
  Calendar as CalendarIcon,
} from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Skeleton } from "@/components/Skeleton";
import { EventCard } from "@/components/EventCard";
import { CalendarGrid } from "@/components/CalendarGrid";
import { useEvents } from "@/hooks/useEvents";
import { formatEventDate } from "@/lib/events";
import type { EventsStackParamList } from "@/navigation/EventsStack";

type Props = NativeStackScreenProps<EventsStackParamList, "EventsList">;

type Filter = "all" | "marathon" | "training";
type ViewMode = "list" | "grid";

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function EventsList({ navigation }: Props) {
  const eventsQuery = useEvents();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return (eventsQuery.data ?? []).filter((e) =>
      filter === "all" ? true : e.type === filter,
    );
  }, [eventsQuery.data, filter]);

  const visible = useMemo(() => {
    if (!selectedDate) return filtered;
    return filtered.filter(
      (e) => toISODate(new Date(e.start_at)) === selectedDate,
    );
  }, [filtered, selectedDate]);

  const grouped = useMemo(() => {
    const byDate = new Map<string, typeof visible>();
    for (const event of visible) {
      const key = formatEventDate(event.start_at);
      const list = byDate.get(key) ?? [];
      list.push(event);
      byDate.set(key, list);
    }
    return Array.from(byDate.entries());
  }, [visible]);

  const renderFilterChip = (label: string, value: Filter) => {
    const selected = filter === value;
    return (
      <Pressable
        key={value}
        onPress={() => setFilter(value)}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        style={[
          styles.filterChip,
          selected ? styles.filterChipSelected : styles.filterChipUnselected,
        ]}
      >
        <Text
          variant="bodyS"
          color={
            selected ? theme.textColors.ink[900] : theme.semantic.text.secondary
          }
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.root}>
      <View
        style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}
      >
        <View style={styles.titleRow}>
          <View style={styles.titleInline}>
            <Text variant="displayL">Events</Text>
            <CalendarDays
              size={28}
              color={theme.textColors.ink[900]}
              strokeWidth={2}
            />
          </View>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate("MyRegistrations")}
              accessibilityRole="button"
              hitSlop={8}
            >
              <Text variant="bodyS" color={theme.semantic.text.brand}>
                My registrations
              </Text>
            </Pressable>
            <View style={styles.viewToggle}>
              <Pressable
                onPress={() => setViewMode("list")}
                accessibilityRole="button"
                accessibilityLabel="List view"
                accessibilityState={{ selected: viewMode === "list" }}
                style={[
                  styles.toggleBtn,
                  viewMode === "list" && styles.toggleBtnSelected,
                ]}
              >
                <List
                  size={18}
                  color={theme.textColors.ink[900]}
                  strokeWidth={2.25}
                />
              </Pressable>
              <Pressable
                onPress={() => setViewMode("grid")}
                accessibilityRole="button"
                accessibilityLabel="Calendar view"
                accessibilityState={{ selected: viewMode === "grid" }}
                style={[
                  styles.toggleBtn,
                  viewMode === "grid" && styles.toggleBtnSelected,
                ]}
              >
                <CalendarIcon
                  size={18}
                  color={theme.textColors.ink[900]}
                  strokeWidth={2.25}
                />
              </Pressable>
            </View>
          </View>
        </View>
        <Text
          variant="bodyM"
          color={theme.semantic.text.secondary}
          style={styles.sub}
        >
          Training runs and Marathons.
        </Text>

        <View style={styles.filterRow}>
          {renderFilterChip("All", "all")}
          {renderFilterChip("Marathons", "marathon")}
          {renderFilterChip("Training", "training")}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={eventsQuery.isRefetching}
            onRefresh={() => eventsQuery.refetch()}
            tintColor={theme.fills.matooke[500]}
          />
        }
      >
        {viewMode === "grid" ? (
          <>
            <CalendarGrid
              events={filtered}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
            {selectedDate ? (
              <View style={styles.selectedDayHeader}>
                <Text variant="caption" color={theme.semantic.text.secondary}>
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                    "en-GB",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    },
                  )}
                </Text>
                <Pressable onPress={() => setSelectedDate(null)} hitSlop={8}>
                  <Text variant="bodyS" color={theme.semantic.text.brand}>
                    Clear
                  </Text>
                </Pressable>
              </View>
            ) : null}
            <View style={styles.gridBottomGap} />
          </>
        ) : null}

        {eventsQuery.isLoading ? (
          <View style={styles.list}>
            <Skeleton variant="card" />
            <View style={styles.gap} />
            <Skeleton variant="card" />
          </View>
        ) : grouped.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="bodyL" align="center">
              No events
            </Text>
            <Text
              variant="bodyM"
              color={theme.semantic.text.secondary}
              align="center"
              style={styles.emptySub}
            >
              {selectedDate
                ? "Nothing scheduled for this day."
                : filter === "all"
                  ? "Check back soon. New training runs are posted weekly."
                  : `No ${filter} events scheduled right now.`}
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {grouped.map(([date, events]) => (
              <View key={date} style={styles.group}>
                <Text variant="caption" color={theme.semantic.text.secondary}>
                  {date}
                </Text>
                <View style={styles.groupList}>
                  {/* TODO: wire registration status from the user's registrations. */}
                  {events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      variant="compact"
                      registrationState="open"
                      onPress={() =>
                        navigation.navigate("EventDetail", {
                          eventId: event.id,
                        })
                      }
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {eventsQuery.isError ? (
          <Pressable
            onPress={() => eventsQuery.refetch()}
            style={styles.errorBox}
          >
            <Text
              variant="bodyS"
              color={theme.semantic.text.danger}
              align="center"
            >
              Couldn't load events. Tap to retry.
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.semantic.bg.page },
  header: {
    backgroundColor: theme.semantic.bg.page,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  titleInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  headerActions: {
    alignItems: "flex-end",
    gap: theme.spacing.xs,
  },
  sub: { marginTop: theme.spacing.xs },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  filterChip: {
    minHeight: 36,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.chip,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipSelected: {
    backgroundColor: theme.fills.matooke[100],
  },
  filterChipUnselected: {
    backgroundColor: "transparent",
  },
  viewToggle: {
    flexDirection: "row",
    gap: theme.spacing.xxs,
    backgroundColor: theme.fills.matooke[100],
    borderWidth: 1,
    borderColor: theme.fills.ink[300],
    borderRadius: theme.radii.button,
    padding: 3,
  },
  toggleBtn: {
    width: 36,
    height: 32,
    borderRadius: theme.radii.button - 2,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleBtnSelected: {
    backgroundColor: theme.fills.paper,
  },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 120,
  },
  gridBottomGap: { height: theme.spacing.lg },
  selectedDayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  list: { gap: theme.spacing.md },
  group: { marginBottom: theme.spacing.lg },
  groupList: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
  gap: { height: theme.spacing.md },
  empty: {
    paddingVertical: theme.spacing["4xl"],
    paddingHorizontal: theme.spacing.lg,
    alignItems: "center",
  },
  emptySub: { marginTop: theme.spacing.xs },
  errorBox: {
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
});
