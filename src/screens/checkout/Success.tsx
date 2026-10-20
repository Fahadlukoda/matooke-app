import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle2 } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { usePayment } from "@/hooks/usePayments";
import { useRegistrationById, useEvent } from "@/hooks/useEvents";
import { formatUgx, methodLabel } from "@/lib/payments";
import { formatEventDate } from "@/lib/events";
import { track } from "@/lib/analytics";
import type { EventsStackParamList } from "@/navigation/EventsStack";

type Props = NativeStackScreenProps<EventsStackParamList, "Success">;

export function Success({ route, navigation }: Props) {
  const { paymentId } = route.params;

  const paymentQuery = usePayment(paymentId);
  const payment = paymentQuery.data;

  const registrationQuery = useRegistrationById(
    payment?.registration_id ?? undefined,
  );
  const eventQuery = useEvent(registrationQuery.data?.event_id ?? undefined);

  const event = eventQuery.data;
  const registration = registrationQuery.data;

  const [slowLoad, setSlowLoad] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSlowLoad(true), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (payment?.status === "succeeded" && event) {
      track("payment_succeeded", {
        event_id: event.id,
        amount_ugx: payment.amount_ugx,
      });
    }
  }, [payment?.status, payment?.amount_ugx, event]);

  if (!payment || !event) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.fills.matooke[500]} />
          <Text
            variant="bodyM"
            color={theme.semantic.text.secondary}
            style={styles.loadingText}
          >
            Loading receipt…
          </Text>
          {slowLoad ? (
            <Text
              variant="bodyS"
              color={theme.semantic.text.secondary}
              style={styles.slowNote}
            >
              Still working. Check your connection if this doesn't finish in a
              moment.
            </Text>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroBlock}>
          <CheckCircle2
            size={64}
            color={theme.fills.matooke[500]}
            strokeWidth={1.75}
          />
          <Text variant="displayL" align="center" style={styles.heading}>
            Payment Successful
          </Text>
          <Text
            variant="bodyM"
            color={theme.semantic.text.secondary}
            align="center"
            style={styles.sub}
          >
            Your spot is confirmed.
          </Text>
        </View>

        <Card>
          <Text variant="caption" color={theme.semantic.text.secondary}>
            Receipt
          </Text>
          <Text variant="displayM" style={styles.eventTitle}>
            {event.title}
          </Text>
          <Text
            variant="bodyS"
            color={theme.semantic.text.secondary}
            tabular
            style={styles.eventMeta}
          >
            {formatEventDate(event.start_at)} · {registration?.distance_km} km
          </Text>

          <View style={styles.receiptHeading}>
            <Text variant="bodyS" color={theme.semantic.text.secondary}>
              Amount paid
            </Text>
            <Text variant="displayM" tabular style={styles.amount}>
              {formatUgx(payment.amount_ugx)}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailRow}>
            <Text variant="bodyS" color={theme.semantic.text.secondary}>
              Payment method
            </Text>
            <Text variant="bodyS" style={styles.detailValue}>
              {methodLabel(payment.method)}
            </Text>
          </View>
          <View style={[styles.detailRow, styles.detailSpacing]}>
            <Text variant="bodyS" color={theme.semantic.text.secondary}>
              Transaction ID
            </Text>
            <Text
              variant="caption"
              color={theme.semantic.text.secondary}
              tabular
              selectable
              style={styles.detailValue}
            >
              {payment.provider_ref ?? payment.merchant_reference}
            </Text>
          </View>
          <View style={[styles.detailRow, styles.detailSpacing]}>
            <Text variant="bodyS" color={theme.semantic.text.secondary}>
              Date
            </Text>
            <Text variant="bodyS" tabular style={styles.detailValue}>
              {new Date(payment.created_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </Text>
          </View>
        </Card>

        <View style={styles.gap} />

        <Button
          label="View my registrations"
          onPress={() => navigation.navigate("MyRegistrations")}
          variant="primary"
          size="lg"
          fullWidth
        />
        <View style={styles.gapSm} />
        <Button
          label="Back to events"
          onPress={() => navigation.navigate("EventsList")}
          variant="secondary"
          size="lg"
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.lg,
  },
  loadingText: { marginTop: theme.spacing.md },
  slowNote: {
    marginTop: theme.spacing.md,
    textAlign: "center",
    maxWidth: 300,
  },
  scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing["2xl"] },
  heroBlock: {
    alignItems: "center",
    paddingVertical: theme.spacing["2xl"],
  },
  heading: { marginTop: theme.spacing.md },
  sub: { marginTop: theme.spacing.xs, maxWidth: 320 },
  eventTitle: { marginTop: theme.spacing.xs },
  eventMeta: { marginTop: theme.spacing.xs },
  receiptHeading: { marginTop: theme.spacing.lg },
  amount: { marginTop: theme.spacing.xxs },
  divider: { marginVertical: theme.spacing.md },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  detailSpacing: { marginTop: theme.spacing.sm },
  detailValue: { flexShrink: 1, textAlign: "right" },
  gap: { height: theme.spacing.xl },
  gapSm: { height: theme.spacing.sm },
});
