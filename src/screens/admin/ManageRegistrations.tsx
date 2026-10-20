import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronDown, ChevronRight } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Chip } from "@/components/Chip";
import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useEvents } from "@/hooks/useEvents";
import {
  useMarkRegistrationPaid,
  useConfirmRegistration,
  useAssignBib,
  useAdminCancelRegistration,
} from "@/hooks/useAdmin";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { formatEventDate, formatDistance } from "@/lib/events";
import type { AdminStackParamList } from "@/navigation/AdminStack";

type Props = NativeStackScreenProps<AdminStackParamList, "ManageRegistrations">;

type AdminRegistration = {
  id: string;
  event_id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  source: "member" | "guest" | "admin";
  distance_km: number;
  status: "pending" | "paid" | "confirmed" | "cancelled" | "refunded";
  bib: string | null;
  registered_at: string;
  profile: { full_name: string; avatar_url: string | null } | null;
};

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

async function fetchRegistrations(
  eventId: string,
): Promise<AdminRegistration[]> {
  const { data, error } = await supabase
    .from("event_registrations")
    .select(
      `id, event_id, user_id, guest_name, guest_email, guest_phone, source,
       distance_km, status, bib, registered_at,
       profile:profiles!event_registrations_user_id_fkey (full_name, avatar_url)`,
    )
    .eq("event_id", eventId)
    .order("registered_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AdminRegistration[];
}

export function ManageRegistrations({ navigation }: Props) {
  const eventsQuery = useEvents();
  const upcoming = useMemo(
    () =>
      (eventsQuery.data ?? []).filter(
        (e) => new Date(e.start_at).getTime() > Date.now() - 86400000,
      ),
    [eventsQuery.data],
  );

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]["value"]>("all");

  const registrationsQuery = useQuery({
    queryKey: ["admin", "registrations", selectedEventId],
    queryFn: () => fetchRegistrations(selectedEventId!),
    enabled: Boolean(selectedEventId),
  });

  const markPaid = useMarkRegistrationPaid();
  const confirm = useConfirmRegistration();
  const assignBib = useAssignBib();
  const cancelReg = useAdminCancelRegistration();

  const selectedEvent = upcoming.find((e) => e.id === selectedEventId) ?? null;
  const rows = registrationsQuery.data ?? [];
  const filtered = rows.filter((r) =>
    statusFilter === "all" ? true : r.status === statusFilter,
  );

  function confirmAsync(title: string, message: string): Promise<boolean> {
    if (Platform.OS === "web") {
      return Promise.resolve(window.confirm(`${title}\n\n${message}`));
    }
    return new Promise((resolve) => {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        { text: "Confirm", style: "destructive", onPress: () => resolve(true) },
      ]);
    });
  }

  async function onCancelReg(reg: AdminRegistration) {
    const ok = await confirmAsync(
      "Cancel this registration?",
      "The user will see it as cancelled.",
    );
    if (!ok) return;
    await cancelReg.mutateAsync(reg.id);
  }

  async function onAssignBib(reg: AdminRegistration) {
    // Prompt is done via a small inline input in the row.
    // This function is only called when the row's inline input is submitted.
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Registrations" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text
          variant="caption"
          color={theme.semantic.text.secondary}
          style={styles.sectionLabel}
        >
          Select event
        </Text>
        <View style={styles.gapSm} />
        {upcoming.length === 0 ? (
          <Text variant="bodyM" color={theme.semantic.text.secondary}>
            No upcoming events.
          </Text>
        ) : (
          <Card padding={0}>
            <View style={styles.eventList}>
              {upcoming.map((e) => (
                <Pressable
                  key={e.id}
                  onPress={() => setSelectedEventId(e.id)}
                  accessibilityRole="button"
                  style={[
                    styles.eventRow,
                    selectedEventId === e.id && styles.eventRowSelected,
                  ]}
                >
                  <View style={styles.eventRowBody}>
                    <Text variant="bodyM" numberOfLines={1}>
                      {e.title}
                    </Text>
                    <Text
                      variant="bodyS"
                      color={theme.semantic.text.secondary}
                      tabular
                    >
                      {formatEventDate(e.start_at)}
                    </Text>
                  </View>
                  <ChevronRight
                    size={18}
                    color={theme.textColors.ink[300]}
                    strokeWidth={2}
                  />
                </Pressable>
              ))}
            </View>
          </Card>
        )}

        {selectedEvent ? (
          <>
            <Text
              variant="caption"
              color={theme.semantic.text.secondary}
              style={styles.sectionLabel}
            >
              Status
            </Text>
            <Card>
              <View style={styles.chipRow}>
                {STATUS_FILTERS.map((f) => (
                  <Chip
                    key={f.value}
                    label={f.label}
                    selected={statusFilter === f.value}
                    onPress={() => setStatusFilter(f.value)}
                  />
                ))}
              </View>
            </Card>

            {registrationsQuery.isLoading ? (
              <Text
                variant="bodyM"
                color={theme.semantic.text.secondary}
                align="center"
                style={styles.status}
              >
                Loading…
              </Text>
            ) : registrationsQuery.isError ? (
              <Text
                variant="bodyS"
                color={theme.semantic.text.danger}
                align="center"
                style={styles.status}
              >
                Could not load registrations. Try again later.
              </Text>
            ) : filtered.length === 0 ? (
              <Text
                variant="bodyM"
                color={theme.semantic.text.secondary}
                align="center"
                style={styles.status}
              >
                No registrations match this filter.
              </Text>
            ) : (
              <View style={styles.list}>
                {filtered.map((reg) => (
                  <RegistrationCard
                    key={reg.id}
                    reg={reg}
                    onMarkPaid={() => markPaid.mutateAsync(reg.id)}
                    onConfirm={() => confirm.mutateAsync(reg.id)}
                    onAssignBib={(bib) =>
                      assignBib.mutateAsync({ registrationId: reg.id, bib })
                    }
                    onCancel={() => onCancelReg(reg)}
                    busy={
                      markPaid.isPending ||
                      confirm.isPending ||
                      assignBib.isPending ||
                      cancelReg.isPending
                    }
                  />
                ))}
              </View>
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function RegistrationCard({
  reg,
  onMarkPaid,
  onConfirm,
  onAssignBib,
  onCancel,
  busy,
}: {
  reg: AdminRegistration;
  onMarkPaid: () => void;
  onConfirm: () => void;
  onAssignBib: (bib: string) => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const [bibInput, setBibInput] = useState(reg.bib ?? "");
  const displayName = reg.profile?.full_name ?? reg.guest_name ?? "Unknown";

  return (
    <Card>
      <View style={styles.regHead}>
        <View style={styles.regHeadLeft}>
          <Text variant="bodyM">{displayName}</Text>
          <Text
            variant="bodyS"
            color={theme.semantic.text.secondary}
            tabular
            style={styles.regSub}
          >
            {formatDistance(reg.distance_km)}
            {reg.guest_phone ? ` · ${reg.guest_phone}` : ""}
          </Text>
        </View>
        <Badge
          label={reg.status}
          variant={
            reg.status === "confirmed"
              ? "success"
              : reg.status === "paid"
                ? "gold"
                : reg.status === "cancelled"
                  ? "neutral"
                  : "warning"
          }
          size="sm"
        />
      </View>

      {reg.source === "guest" ? (
        <Text
          variant="bodyS"
          color={theme.semantic.text.tertiary}
          style={styles.guestTag}
        >
          Guest
        </Text>
      ) : null}

      <Divider style={styles.regDivider} />

      <View style={styles.bibRow}>
        <View style={styles.bibInput}>
          <TextField
            label="Bib"
            value={bibInput}
            onChangeText={setBibInput}
            keyboardType="number-pad"
            placeholder="Optional"
          />
        </View>
        <View style={styles.bibBtn}>
          <Button
            label="Save bib"
            onPress={() => onAssignBib(bibInput)}
            variant="secondary"
            size="md"
            disabled={busy || bibInput.trim() === (reg.bib ?? "")}
          />
        </View>
      </View>

      <View style={styles.actions}>
        {reg.status === "pending" ? (
          <Button
            label="Mark paid"
            onPress={onMarkPaid}
            variant="gold"
            size="sm"
            disabled={busy}
          />
        ) : null}
        {reg.status === "paid" ? (
          <Button
            label="Confirm"
            onPress={onConfirm}
            variant="hero"
            size="sm"
            disabled={busy}
          />
        ) : null}
        {reg.status !== "cancelled" ? (
          <Button
            label="Cancel"
            onPress={onCancel}
            variant="ghost"
            size="sm"
            disabled={busy}
          />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  scroll: { padding: theme.spacing.lg, paddingBottom: 120 },
  sectionLabel: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  gapSm: { height: theme.spacing.sm },
  status: { marginTop: theme.spacing.lg },
  eventList: { gap: theme.spacing.xs },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.md,
    backgroundColor: theme.fills.matooke[100],
    borderRadius: theme.radii.row,
  },
  eventRowSelected: {
    borderWidth: 2,
    borderColor: theme.fills.matooke[500],
  },
  eventRowBody: { flex: 1 },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  list: { gap: theme.spacing.md },
  regHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing.sm,
  },
  regHeadLeft: { flex: 1 },
  regSub: { marginTop: theme.spacing.xxs },
  guestTag: { marginTop: theme.spacing.xs },
  regDivider: { marginVertical: theme.spacing.md },
  bibRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: theme.spacing.sm,
  },
  bibInput: { flex: 1 },
  bibBtn: { paddingBottom: 4 },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
});
