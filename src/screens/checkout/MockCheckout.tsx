import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Check, X, Smartphone, Timer } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { simulateWebhook, formatUgx } from "@/lib/payments";
import type { EventsStackParamList } from "@/navigation/EventsStack";

type Props = NativeStackScreenProps<EventsStackParamList, "MockCheckout">;

export function MockCheckout({ route, navigation }: Props) {
  const {
    paymentId,
    merchantReference,
    providerRef,
    amountUgx,
    method,
    phone,
  } = route.params;

  const [busy, setBusy] = useState<"success" | "failure" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function trigger(status: "succeeded" | "failed") {
    setBusy(status === "succeeded" ? "success" : "failure");
    setError(null);

    try {
      await simulateWebhook({
        merchantReference,
        providerRef,
        status,
        amountUgx,
        method,
        phone,
      });

      navigation.replace("Pending", { paymentId });
    } catch (e) {
      setError("Simulation failed. Check the Edge Function logs.");
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.body}>
          <View style={styles.pendingIcon}>
            <Smartphone
              size={38}
              color={theme.fills.matooke[600]}
              strokeWidth={1.8}
            />
            <View style={styles.timerBadge}>
              <Timer size={18} color={theme.textColors.paper} strokeWidth={2} />
            </View>
          </View>
          <Text variant="displayL" align="center" style={styles.heading}>
            Processing payment...
          </Text>
          <Text
            variant="bodyM"
            color={theme.semantic.text.secondary}
            style={styles.sub}
          >
            Check your phone for a prompt. This demo lets you choose the outcome
            so you can see the rest of the checkout flow.
          </Text>

          <View style={styles.gapLg} />

          <Card>
            <Text variant="bodyS" color={theme.semantic.text.secondary}>
              Amount
            </Text>
            <Text variant="displayM" tabular style={styles.amount}>
              {formatUgx(amountUgx)}
            </Text>
            <Text
              variant="bodyS"
              color={theme.semantic.text.secondary}
              tabular
              style={styles.ref}
            >
              Ref {merchantReference}
            </Text>
            <Text variant="bodyS" color={theme.semantic.text.secondary} tabular>
              To {phone}
            </Text>
          </Card>

          {error ? (
            <Text
              variant="bodyS"
              color={theme.semantic.text.danger}
              style={styles.error}
            >
              {error}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Text
            variant="caption"
            color={theme.semantic.text.secondary}
            align="center"
            style={styles.demoLabel}
          >
            Demo Controls
          </Text>
          <Button
            label="Simulate Success"
            onPress={() => trigger("succeeded")}
            variant="primary"
            size="lg"
            fullWidth
            loading={busy === "success"}
            disabled={busy !== null}
            leadingIcon={
              <Check
                size={16}
                color={theme.textColors.paper}
                strokeWidth={2.5}
              />
            }
          />
          <View style={styles.gapMd} />
          <Button
            label="Simulate Failure"
            onPress={() => trigger("failed")}
            variant="secondary"
            size="lg"
            fullWidth
            loading={busy === "failure"}
            disabled={busy !== null}
            leadingIcon={
              <X
                size={16}
                color={theme.textColors.ink[900]}
                strokeWidth={2.5}
              />
            }
          />
          <View style={styles.gapMd} />
          <Button
            label="Cancel checkout"
            onPress={() => navigation.popToTop()}
            variant="ghost"
            size="md"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    justifyContent: "space-between",
  },
  body: { flex: 1, justifyContent: "center" },
  pendingIcon: {
    width: 88,
    height: 88,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 44,
    backgroundColor: theme.fills.matooke[100],
    position: "relative",
  },
  timerBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: theme.fills.matooke[600],
    borderWidth: 2,
    borderColor: theme.semantic.bg.page,
  },
  heading: { marginTop: theme.spacing.lg },
  sub: { marginTop: theme.spacing.sm, textAlign: "center" },
  gapLg: { height: theme.spacing.xl },
  gapMd: { height: theme.spacing.md },
  amount: { marginTop: theme.spacing.xs },
  ref: { marginTop: theme.spacing.md },
  error: { marginTop: theme.spacing.md },
  actions: { paddingTop: theme.spacing.lg },
  demoLabel: { marginBottom: theme.spacing.sm },
});
