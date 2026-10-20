import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Smartphone, Check } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useEvent, useRegistrationForEvent } from "@/hooks/useEvents";
import { useInitiatePayment } from "@/hooks/usePayments";
import { formatUgx, type PaymentMethod } from "@/lib/payments";
import { track } from "@/lib/analytics";
import type { EventsStackParamList } from "@/navigation/EventsStack";

type Props = NativeStackScreenProps<EventsStackParamList, "MethodSelect">;

const METHODS: { value: PaymentMethod; label: string; hint: string }[] = [
  {
    value: "mtn_momo",
    label: "MTN MoMo",
    hint: "Enter the MTN number to charge.",
  },
  {
    value: "airtel_money",
    label: "Airtel Money",
    hint: "Enter the Airtel number to charge.",
  },
];

export function MethodSelect({ route, navigation }: Props) {
  const { eventId } = route.params;

  const eventQuery = useEvent(eventId);
  const registrationQuery = useRegistrationForEvent(eventId);
  const initiate = useInitiatePayment();

  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const event = eventQuery.data;
  const registration = registrationQuery.data;

  if (!event || !registration) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <ScreenHeader title="Checkout" onBack={() => navigation.goBack()} />
        <View style={styles.center}>
          <Text variant="bodyM" color={theme.semantic.text.secondary}>
            Loading registration…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const amount = event.entry_fee_ugx ?? 0;

  async function onSubmit() {
    setError(null);

    const digits = phone.replace(/\D/g, "");
    if (!method) {
      setError("Choose a payment method to continue.");
      return;
    }
    if (digits.length < 9) {
      setError("Enter the mobile money number to charge.");
      return;
    }

    track("checkout_started", { event_id: event!.id, amount_ugx: amount });
    track("payment_method_selected", { method });

    try {
      const result = await initiate.mutateAsync({
        registrationId: registration!.id,
        method,
        phone: phone.trim(),
      });

      navigation.replace("MockCheckout", {
        paymentId: result.payment_id,
        merchantReference: result.merchant_reference,
        providerRef: result.provider_ref,
        amountUgx: amount,
        method,
        phone: phone.trim(),
      });
    } catch (e) {
      const msg = String(e);
      if (msg.includes("already_paid")) {
        setError("This registration is already paid.");
      } else {
        setError(
          "Could not start checkout. Check your connection and try again.",
        );
      }
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScreenHeader title="Checkout" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="displayM" style={styles.heading}>
            Choose payment method
          </Text>
          <Text
            variant="bodyM"
            color={theme.semantic.text.secondary}
            style={styles.intro}
          >
            Select a mobile money provider for your registration.
          </Text>

          <Card>
            <Text variant="bodyS" color={theme.semantic.text.secondary}>
              Paying for
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
              {registration.distance_km}k · {formatUgx(amount)}
            </Text>
          </Card>

          <View style={styles.gapLg} />

          <Text variant="caption" color={theme.semantic.text.secondary}>
            Payment method
          </Text>
          <View style={styles.methodList}>
            {METHODS.map((m) => {
              const selected = method === m.value;
              return (
                <Pressable
                  key={m.value}
                  onPress={() => setMethod(m.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[
                    styles.methodCard,
                    {
                      backgroundColor: selected
                        ? theme.fills.matooke[100]
                        : theme.fills.paper,
                      borderColor: selected
                        ? theme.fills.matooke[500]
                        : theme.fills.matooke[200],
                    },
                  ]}
                >
                  <View style={styles.methodHead}>
                    <Smartphone
                      size={20}
                      color={theme.textColors.ink[700]}
                      strokeWidth={2}
                    />
                    <Text variant="bodyL" style={styles.methodLabel}>
                      {m.label}
                    </Text>
                    {selected ? (
                      <Check
                        size={18}
                        color={theme.fills.matooke[600]}
                        strokeWidth={2.5}
                      />
                    ) : null}
                  </View>
                  <Text variant="bodyS" color={theme.semantic.text.secondary}>
                    {m.hint}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.gapLg} />

          <TextField
            label="Mobile money number"
            placeholder={
              method === "airtel_money"
                ? "070… or 075…"
                : method === "mtn_momo"
                  ? "077… or 078…"
                  : "Select a provider first"
            }
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            editable={!initiate.isPending && method !== null}
            helper="The number that will receive the PIN prompt."
          />

          {error ? (
            <Text
              variant="bodyS"
              color={theme.semantic.text.danger}
              style={styles.error}
            >
              {error}
            </Text>
          ) : null}
        </ScrollView>
        <View style={[styles.footer, { paddingBottom: theme.spacing.md }]}>
          <Text
            variant="bodyS"
            color={theme.semantic.text.tertiary}
            align="center"
            style={styles.demoNote}
          >
            Demo Mode: No real payment will be processed.
          </Text>
          <Button
            label={`Continue · ${formatUgx(amount)}`}
            onPress={onSubmit}
            variant="primary"
            size="lg"
            fullWidth
            loading={initiate.isPending}
            disabled={
              initiate.isPending ||
              method === null ||
              phone.replace(/\D/g, "").length < 9
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  flex: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { flex: 1 },
  scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xl },
  heading: { marginBottom: theme.spacing.xs },
  intro: { marginBottom: theme.spacing.lg },
  eventTitle: { marginTop: theme.spacing.xs },
  eventMeta: { marginTop: theme.spacing.xs },
  gapLg: { height: theme.spacing.xl },
  methodList: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
  methodCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radii.card,
    borderWidth: 1,
  },
  methodHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  methodLabel: { flex: 1 },
  error: { marginTop: theme.spacing.md },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    backgroundColor: theme.semantic.bg.page,
  },
  demoNote: { marginBottom: theme.spacing.sm },
});
