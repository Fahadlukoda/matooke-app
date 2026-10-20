import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import { MapPin, Clock, Users } from "lucide-react-native";

import { theme } from "@/theme";
import { Text } from "./Text";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { images } from "@/lib/images";
import {
  type Event,
  formatEventDate,
  formatEventTime,
  formatFee,
  formatDistance,
} from "@/lib/events";

type Variant = "default" | "compact";
type RegistrationState = "registered" | "open" | "closed";

type Props = {
  event: Event;
  onPress?: () => void;
  variant?: Variant;
  registrationCount?: number;
  registrationState?: RegistrationState;
};

const ACTION_LABEL: Record<RegistrationState, string> = {
  registered: "Registered",
  open: "Register",
  closed: "Registration closed",
};

export function EventCard({
  event,
  onPress,
  variant = "default",
  registrationCount,
  registrationState,
}: Props) {
  const date = formatEventDate(event.start_at);
  const time = formatEventTime(event.start_at);
  const fee = formatFee(event.entry_fee_ugx, event.is_paid);
  const isCompact = variant === "compact";
  const posterSource = event.poster_url
    ? { uri: event.poster_url }
    : images.trainingPoster;
  const registrationStatus = registrationState ?? "open";

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${date}`}
    >
      {({ pressed }) => (
        <View
          style={[
            styles.card,
            isCompact ? styles.cardCompact : styles.cardDefault,
            theme.shadows.raised,
            pressed && styles.pressed,
          ]}
        >
          <Image
            source={posterSource}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <View style={styles.overlay} />
          <View style={[styles.content, isCompact && styles.contentCompact]}>
            <View style={styles.badgeRow}>
              <Badge
                label={event.type === "marathon" ? "Marathon" : "Training Run"}
                variant={event.type === "marathon" ? "gold" : "success"}
                size="sm"
              />
              <View style={styles.feePill}>
                <Text variant="caption" color={theme.textColors.paper} tabular>
                  {fee}
                </Text>
              </View>
            </View>

            <Text
              variant="displayM"
              color={theme.textColors.paper}
              numberOfLines={2}
              style={styles.title}
            >
              {event.title}
            </Text>

            <View style={styles.meta}>
              <View style={styles.metaRow}>
                <Clock
                  size={14}
                  color="rgba(251,251,247,0.75)"
                  strokeWidth={2}
                />
                <Text
                  variant="bodyS"
                  color="rgba(251,251,247,0.85)"
                  tabular
                  numberOfLines={1}
                  style={styles.metaText}
                >
                  {date} · {time}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <MapPin
                  size={14}
                  color="rgba(251,251,247,0.75)"
                  strokeWidth={2}
                />
                <Text
                  variant="bodyS"
                  color="rgba(251,251,247,0.85)"
                  numberOfLines={1}
                  style={styles.metaText}
                >
                  {event.venue_name}
                </Text>
              </View>
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.distanceRow}>
                {event.distances_km.slice(0, 4).map((distance) => (
                  <View key={distance} style={styles.distanceChip}>
                    <Text
                      variant="caption"
                      color={theme.textColors.paper}
                      tabular
                    >
                      {formatDistance(distance)}
                    </Text>
                  </View>
                ))}
              </View>

              {registrationCount != null ? (
                <View style={styles.registrationCount}>
                  <Users
                    size={14}
                    color="rgba(251,251,247,0.75)"
                    strokeWidth={2}
                  />
                  <Text variant="bodyS" color="rgba(251,251,247,0.85)" tabular>
                    {registrationCount}
                    {event.capacity ? ` / ${event.capacity}` : ""}
                  </Text>
                </View>
              ) : null}
            </View>

            {registrationState ? (
              <View
                pointerEvents="none"
                accessibilityElementsHidden
                importantForAccessibility="no-hide-descendants"
                style={styles.actionWrap}
              >
                <Button
                  label={ACTION_LABEL[registrationStatus]}
                  onPress={() => undefined}
                  variant={
                    registrationStatus === "closed"
                      ? "ghost"
                      : registrationStatus === "registered"
                        ? "secondary"
                        : "hero"
                  }
                  size="sm"
                  fullWidth
                  disabled={registrationStatus !== "open"}
                  style={
                    registrationStatus === "closed"
                      ? styles.actionClosed
                      : undefined
                  }
                />
              </View>
            ) : null}
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.card,
    overflow: "hidden",
    backgroundColor: theme.fills.paper,
  },
  cardDefault: {
    height: 260,
  },
  cardCompact: {
    height: 240,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    padding: theme.spacing.md,
  },
  contentCompact: {
    padding: theme.spacing.sm,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  feePill: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.radii.badge,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  meta: {
    gap: theme.spacing.xxs,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xxs,
  },
  metaText: {
    flexShrink: 1,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  distanceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    flex: 1,
  },
  distanceChip: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: theme.radii.badge,
  },
  registrationCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xxs,
  },
  actionWrap: { marginTop: theme.spacing.sm },
  actionClosed: { backgroundColor: theme.fills.ink[300] },
  pressed: {
    transform: [{ translateY: -2 }],
  },
});
