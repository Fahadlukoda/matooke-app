import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MapPin, Users, ChevronLeft, Check } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { Divider } from "@/components/Divider";
import { Scrim } from "@/components/Scrim";
import {
  useEvent,
  useRegistrationForEvent,
  useRegistrationCount,
  useRegisterForEvent,
  useCancelRegistration,
} from "@/hooks/useEvents";
import { usePaymentByRegistration } from "@/hooks/usePayments";
import { useAuthStore } from "@/state/auth";
import { track } from "@/lib/analytics";
import {
  formatEventDate,
  formatEventTime,
  formatFee,
  formatDistance,
  type Event,
} from "@/lib/events";
import type { EventsStackParamList } from "@/navigation/EventsStack";

type Props = NativeStackScreenProps<EventsStackParamList, "EventDetail">;

function confirmAsync(title: string, message: string): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
      { text: "Yes", style: "destructive", onPress: () => resolve(true) },
    ]);
  });
}

export function EventDetail({ route, navigation }: Props) {
  const { eventId } = route.params;
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const rootNav = useNavigation<any>();

  const eventQuery = useEvent(eventId);
  const registrationQuery = useRegistrationForEvent(eventId);
  const countQuery = useRegistrationCount(eventId);
  const paymentQuery = usePaymentByRegistration(registrationQuery.data?.id);

  const registerMutation = useRegisterForEvent();
  const cancelMutation = useCancelRegistration();
  const submittingRef = useRef(false);

  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);

  const event = eventQuery.data;
  const registration = registrationQuery.data;
  const payment = paymentQuery.data;
  const count = countQuery.data ?? 0;

  React.useEffect(() => {
    if (event && selectedDistance == null && event.distances_km.length === 1) {
      setSelectedDistance(event.distances_km[0]!);
    }
  }, [event, selectedDistance]);

  React.useEffect(() => {
    if (event) {
      track("event_viewed", { event_id: event.id, type: event.type });
    }
  }, [event]);

  if (eventQuery.isLoading || !event) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.fills.matooke[500]} />
        </View>
      </SafeAreaView>
    );
  }

  const loadedEvent: Event = event;
  const isRegistered = Boolean(
    registration && registration.status !== "cancelled",
  );
  const isPaid = Boolean(payment && payment.status === "succeeded");
  const isFull =
    loadedEvent.capacity != null &&
    count >= loadedEvent.capacity &&
    !isRegistered;
  const fee = formatFee(loadedEvent.entry_fee_ugx, loadedEvent.is_paid);
  const isFinished = Boolean(loadedEvent.results_published_at);
  const hasPoster = Boolean(loadedEvent.poster_url);

  async function onRegister() {
    if (!user || selectedDistance == null) return;
    if (submittingRef.current) return;

    submittingRef.current = true;
    track("registration_started", {
      event_id: loadedEvent.id,
      distance_km: selectedDistance,
    });
    try {
      await registerMutation.mutateAsync({
        eventId: loadedEvent.id,
        userId: user.id,
        distanceKm: selectedDistance,
      });
      track("registration_completed", {
        event_id: loadedEvent.id,
        distance_km: selectedDistance,
        is_paid: loadedEvent.is_paid,
      });
      if (loadedEvent.is_paid) {
        navigation.navigate("MethodSelect", { eventId: loadedEvent.id });
      }
    } catch {
      // surfaced via mutation state
    } finally {
      submittingRef.current = false;
    }
  }

  async function onCancel() {
    if (!registration) return;
    const ok = await confirmAsync(
      "Cancel registration?",
      "You can register again later if spaces remain.",
    );
    if (!ok) return;

    try {
      await cancelMutation.mutateAsync({
        registrationId: registration.id,
        eventId: loadedEvent.id,
      });
      track("registration_cancelled", {
        event_id: loadedEvent.id,
        distance_km: registration.distance_km,
      });
    } catch {
      // surfaced via mutation state
    }
  }

  function renderFooter() {
    if (isFinished) {
      return (
        <Button
          label="View race results"
          onPress={() =>
            rootNav.navigate("Results", {
              screen: "EventResults",
              params: { eventId: loadedEvent.id },
            })
          }
          variant="primary"
          size="lg"
          fullWidth
        />
      );
    }

    if (isRegistered && loadedEvent.is_paid) {
      return (
        <Button
          label="Complete payment"
          onPress={() =>
            navigation.navigate("MethodSelect", { eventId: loadedEvent.id })
          }
          variant="hero"
          size="lg"
          fullWidth
        />
      );
    }

    if (isRegistered) {
      return (
        <Button
          label="Registered"
          onPress={() => {}}
          variant="primary"
          size="lg"
          fullWidth
          leadingIcon={
            <Check size={18} color={theme.textColors.paper} strokeWidth={2.5} />
          }
          style={styles.registeredButton}
        />
      );
    }

    if (isFull) {
      return (
        <Button
          label="Event full"
          onPress={() => {}}
          variant="secondary"
          size="lg"
          fullWidth
          disabled
        />
      );
    }

    return (
      <Button
        label={
          isFull
            ? "Event full"
            : selectedDistance == null
              ? "Pick a distance"
              : loadedEvent.is_paid
                ? `Continue to payment · ${formatDistance(selectedDistance)}`
                : `Register · ${formatDistance(selectedDistance)}`
        }
        onPress={onRegister}
        variant="primary"
        size="lg"
        fullWidth
        loading={registerMutation.isPending}
        disabled={
          isFull || selectedDistance == null || registerMutation.isPending
        }
      />
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {hasPoster ? (
          <View style={styles.heroWrap}>
            <ImageBackground
              source={{ uri: loadedEvent.poster_url! }}
              style={styles.poster}
              resizeMode="cover"
            >
              <Scrim position="bottom" height="80%" intensity={0.85} />
              <View style={styles.heroOverlay}>
                <View style={styles.badgeRow}>
                  <Badge
                    label={
                      loadedEvent.type === "marathon"
                        ? "Marathon"
                        : "Training Run"
                    }
                    variant={
                      loadedEvent.type === "marathon" ? "gold" : "success"
                    }
                    size="sm"
                  />
                  {isPaid ? (
                    <Badge label="Paid" variant="success" size="sm" />
                  ) : null}
                  {isFinished ? (
                    <Badge label="Finished" variant="role" size="sm" />
                  ) : null}
                </View>
                <Text
                  variant="displayXL"
                  color={theme.textColors.paper}
                  numberOfLines={3}
                  style={styles.heroTitle}
                >
                  {loadedEvent.title}
                </Text>
                <Text
                  variant="bodyM"
                  color="rgba(251,251,247,0.85)"
                  tabular
                  style={styles.heroMeta}
                >
                  {formatEventDate(loadedEvent.start_at)} ·{" "}
                  {formatEventTime(loadedEvent.start_at)}
                </Text>
              </View>
            </ImageBackground>

            <View
              style={[styles.backWrap, { top: insets.top + theme.spacing.md }]}
              pointerEvents="box-none"
            >
              <Pressable
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={styles.backButton}
                hitSlop={8}
              >
                <ChevronLeft
                  size={24}
                  color={theme.textColors.ink[900]}
                  strokeWidth={2.25}
                />
              </Pressable>
            </View>
          </View>
        ) : (
          <SafeAreaView style={styles.plainHeaderSafe} edges={["top"]}>
            <View style={styles.plainHeader}>
              <Pressable
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
                accessibilityLabel="Go back"
                style={styles.plainBackButton}
                hitSlop={8}
              >
                <ChevronLeft
                  size={24}
                  color={theme.textColors.ink[900]}
                  strokeWidth={2.25}
                />
              </Pressable>
              <View style={styles.plainHeaderSpacer} />
            </View>
          </SafeAreaView>
        )}

        <View style={[styles.body, !hasPoster && styles.bodyWithoutHero]}>
          <Text variant="displayM" style={styles.contentTitle}>
            {loadedEvent.title}
          </Text>
          <Text
            variant="bodyM"
            color={theme.semantic.text.secondary}
            tabular
            style={styles.contentMeta}
          >
            {formatEventDate(loadedEvent.start_at)} ·{" "}
            {formatEventTime(loadedEvent.start_at)}
          </Text>

          <View style={[styles.badgeRow, styles.contentBadges]}>
            <Badge
              label={
                loadedEvent.type === "marathon" ? "Marathon" : "Training Run"
              }
              variant={loadedEvent.type === "marathon" ? "gold" : "success"}
            />
            {isPaid ? <Badge label="Paid" variant="success" /> : null}
            {isFinished ? <Badge label="Finished" variant="neutral" /> : null}
          </View>

          <Card padding={theme.spacing.md} style={styles.metaBlock}>
            <View style={styles.metaRow}>
              <MapPin
                size={16}
                color={theme.textColors.ink[500]}
                strokeWidth={2}
              />
              <Text
                variant="bodyM"
                color={theme.semantic.text.secondary}
                style={styles.metaText}
              >
                {loadedEvent.venue_name}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Users
                size={16}
                color={theme.textColors.ink[500]}
                strokeWidth={2}
              />
              <Text
                variant="bodyM"
                color={theme.semantic.text.secondary}
                style={styles.metaText}
                tabular
              >
                {loadedEvent.capacity != null
                  ? `${count} / ${loadedEvent.capacity} registered`
                  : `${count} registered`}
              </Text>
            </View>
          </Card>

          {loadedEvent.description ? (
            <Text
              variant="bodyM"
              color={theme.semantic.text.primary}
              style={styles.description}
            >
              {loadedEvent.description}
            </Text>
          ) : null}

          <Divider style={styles.divider} />

          <Text variant="bodyL" color={theme.textColors.ink[900]}>
            Distances
          </Text>
          <View style={styles.distanceRow}>
            {loadedEvent.distances_km.map((d) => (
              <Chip
                key={d}
                label={formatDistance(d)}
                selected={selectedDistance === d}
                onPress={() => setSelectedDistance(d)}
                disabled={isRegistered || isFinished}
                style={
                  selectedDistance === d
                    ? {
                        borderWidth: 2,
                        borderColor: theme.fills.matooke[500],
                      }
                    : {
                        borderWidth: 1,
                        borderColor: theme.fills.matooke[300],
                      }
                }
              />
            ))}
          </View>

          <Card padding={theme.spacing.md} style={styles.feeCard}>
            <View style={styles.feeRow}>
              <Text variant="bodyM" color={theme.semantic.text.secondary}>
                {loadedEvent.is_paid ? "Entry fee" : "Entry"}
              </Text>
              <Text
                variant="displayM"
                tabular
                color={
                  loadedEvent.is_paid
                    ? theme.semantic.text.primary
                    : theme.fills.matooke[600]
                }
              >
                {loadedEvent.is_paid ? fee : "Free"}
              </Text>
            </View>
            {isRegistered && loadedEvent.is_paid && !isPaid ? (
              <Text
                variant="bodyS"
                color={theme.semantic.text.danger}
                style={styles.paymentPending}
              >
                Payment pending
              </Text>
            ) : null}
          </Card>

          <Text
            variant="bodyS"
            color={
              isFinished || (!isRegistered && !isFull)
                ? theme.semantic.text.secondary
                : isRegistered && (!loadedEvent.is_paid || isPaid)
                  ? theme.fills.matooke[600]
                  : theme.semantic.text.danger
            }
            style={styles.statusNote}
          >
            {isFinished
              ? "This event has ended."
              : isRegistered && (!loadedEvent.is_paid || isPaid)
                ? "You're registered."
                : isRegistered && loadedEvent.is_paid
                  ? "Registration complete. Please complete payment below."
                  : isFull
                    ? "Event capacity reached."
                    : "Select a distance to register."}
          </Text>

          {isRegistered && !isFinished ? (
            <Button
              label="Cancel registration"
              onPress={onCancel}
              variant="ghost"
              size="sm"
              loading={cancelMutation.isPending}
              disabled={cancelMutation.isPending}
              style={styles.cancelRegistration}
            />
          ) : null}

          {registerMutation.isError ? (
            <Text
              variant="bodyS"
              color={theme.semantic.text.danger}
              align="center"
              style={styles.statusNote}
            >
              Couldn't register. Check your connection and try again.
            </Text>
          ) : null}

          {cancelMutation.isError ? (
            <Text
              variant="bodyS"
              color={theme.semantic.text.danger}
              align="center"
              style={styles.statusNote}
            >
              Couldn't cancel. Check your connection and try again.
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom || theme.spacing.xl },
        ]}
      >
        {renderFooter()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.semantic.bg.page },
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  scroll: { paddingBottom: 120 },
  heroWrap: { position: "relative" },
  poster: {
    width: "100%",
    aspectRatio: 3 / 2,
    justifyContent: "flex-end",
    backgroundColor: theme.fills.matooke[200],
  },
  heroOverlay: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  badgeRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    flexWrap: "wrap",
  },
  heroTitle: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    lineHeight: 34,
  },
  heroMeta: { marginTop: theme.spacing.xxs },
  backWrap: { position: "absolute", left: theme.spacing.md },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.fills.paper,
    alignItems: "center",
    justifyContent: "center",
  },
  plainHeaderSafe: { backgroundColor: theme.semantic.bg.page },
  plainHeader: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    paddingHorizontal: theme.spacing.md,
  },
  plainBackButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  plainHeaderSpacer: { width: 44 },
  body: {
    marginTop: -25,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: theme.semantic.bg.page,
  },
  bodyWithoutHero: {
    marginTop: 0,
  },
  contentTitle: { color: theme.textColors.ink[900] },
  contentMeta: { marginTop: theme.spacing.xxs },
  contentBadges: { marginTop: theme.spacing.sm },
  description: { marginTop: theme.spacing.lg },
  metaBlock: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    backgroundColor: theme.fills.matooke[50],
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  metaText: { flexShrink: 1 },
  divider: { marginVertical: theme.spacing.lg },
  distanceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  feeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  feeCard: { marginTop: theme.spacing.xl },
  paymentPending: { marginTop: theme.spacing.xs },
  statusNote: { marginTop: theme.spacing.md },
  cancelRegistration: { alignSelf: "flex-start", marginTop: theme.spacing.xs },
  registeredButton: { backgroundColor: theme.fills.matooke[500] },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing["3xl"],
    backgroundColor: theme.semantic.bg.page,
  },
});
