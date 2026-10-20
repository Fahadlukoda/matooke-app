import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronRight } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Card } from "@/components/Card";
import { Divider } from "@/components/Divider";
import { Badge } from "@/components/Badge";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useEvents } from "@/hooks/useEvents";
import { useUploadResults, usePublishResults } from "@/hooks/useAdmin";
import { parseResultsCSV } from "@/lib/admin";
import { formatResultTime } from "@/lib/results";
import { formatEventDate as formatDate } from "@/lib/events";
import type { AdminStackParamList } from "@/navigation/AdminStack";

type Props = NativeStackScreenProps<AdminStackParamList, "UploadResults">;

export function UploadResults({ navigation }: Props) {
  const eventsQuery = useEvents();
  const pastEvents = useMemo(
    () =>
      (eventsQuery.data ?? []).filter(
        (e) => new Date(e.start_at).getTime() < Date.now(),
      ),
    [eventsQuery.data],
  );

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<ReturnType<
    typeof parseResultsCSV
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedCount, setUploadedCount] = useState<number | null>(null);

  const uploadResults = useUploadResults();
  const publishResults = usePublishResults();

  const selectedEvent =
    pastEvents.find((e) => e.id === selectedEventId) ?? null;

  function onParse() {
    setError(null);
    const rows = parseResultsCSV(csvText);
    if (rows.length === 0) {
      setError("No rows found. Check the format.");
      return;
    }
    setPreview(rows);
  }

  async function onUpload() {
    if (!preview || !selectedEvent) return;
    setError(null);

    const clean = preview.filter((r) => r.errors.length === 0);
    if (clean.length === 0) {
      setError("Every row has an error. Fix them and re-paste.");
      return;
    }

    try {
      const n = await uploadResults.mutateAsync({
        eventId: selectedEvent.id,
        rows: clean.map(({ raw, errors, ...r }) => r),
      });
      setUploadedCount(n);
      setPreview(null);
      setCsvText("");
    } catch (e) {
      setError("Upload failed. Check the console and try again.");
    }
  }

  async function onPublish() {
    if (!selectedEvent) return;
    await publishResults.mutateAsync(selectedEvent.id);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Upload results" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            variant="caption"
            color={theme.semantic.text.secondary}
            style={styles.sectionLabel}
          >
            Select event
          </Text>
          <View style={styles.gapSm} />
          {pastEvents.length === 0 ? (
            <Text variant="bodyM" color={theme.semantic.text.secondary}>
              No past events to attach results to.
            </Text>
          ) : (
            <Card padding={0}>
              <View style={styles.eventList}>
                {pastEvents.map((e) => (
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
                        {formatDate(e.start_at)}
                        {e.results_published_at ? " · Published" : ""}
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
              <View style={styles.gapLg} />

              {selectedEvent.results_published_at && uploadedCount === null ? (
                <Card>
                  <Text variant="bodyM">
                    Results for this event are already published.
                  </Text>
                  <View style={styles.gapSm} />
                  <Button
                    label="Add more results"
                    onPress={() => setUploadedCount(0)}
                    variant="secondary"
                    size="md"
                  />
                </Card>
              ) : null}

              {!selectedEvent.results_published_at || uploadedCount !== null ? (
                <>
                  <Text
                    variant="caption"
                    color={theme.semantic.text.secondary}
                    style={styles.sectionLabel}
                  >
                    Paste CSV
                  </Text>
                  <Card>
                    <Text
                      variant="bodyS"
                      color={theme.semantic.text.secondary}
                      style={styles.formatNote}
                    >
                      Columns: name, bib, position, distance_km, time, gender,
                      age_group. One runner per line. Times as MM:SS or H:MM:SS.
                    </Text>
                    <View style={styles.gapSm} />
                    <TextField
                      label=""
                      value={csvText}
                      onChangeText={setCsvText}
                      multiline
                      numberOfLines={10}
                      textAlignVertical="top"
                      placeholder={
                        "Amina K., 1178, 1, 21, 1:42:00, female, 20-29\nBrian O., 0992, 2, 21, 1:45:45, male, 30-39"
                      }
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

                    <View style={styles.gap} />
                    <Button
                      label="Preview"
                      onPress={onParse}
                      variant="secondary"
                      size="lg"
                      fullWidth
                      disabled={!csvText.trim()}
                    />
                  </Card>
                </>
              ) : null}

              {preview ? (
                <>
                  <View style={styles.gapLg} />
                  <Text variant="caption" color={theme.semantic.text.secondary}>
                    Preview
                  </Text>
                  <View style={styles.gapSm} />
                  <Card padding={0}>
                    {preview.map((row, i) => (
                      <React.Fragment key={i}>
                        {i > 0 ? <Divider inset={theme.spacing.md} /> : null}
                        <View style={styles.previewRow}>
                          <View style={styles.previewBody}>
                            <Text variant="bodyM" numberOfLines={1}>
                              {row.display_name || "(missing name)"}
                            </Text>
                            <Text
                              variant="bodyS"
                              color={theme.semantic.text.secondary}
                              tabular
                              style={styles.previewMeta}
                            >
                              {row.bib ?? "—"} · {row.distance_km}k ·{" "}
                              {row.duration_s > 0
                                ? formatResultTime(row.duration_s)
                                : "—"}
                            </Text>
                          </View>
                          {row.errors.length > 0 ? (
                            <Badge
                              label={row.errors[0]!}
                              variant="danger"
                              size="sm"
                            />
                          ) : (
                            <Badge label="OK" variant="success" size="sm" />
                          )}
                        </View>
                      </React.Fragment>
                    ))}
                  </Card>

                  <View style={styles.gap} />
                  <Button
                    label="Upload results"
                    onPress={onUpload}
                    variant="hero"
                    size="lg"
                    fullWidth
                    loading={uploadResults.isPending}
                    disabled={
                      uploadResults.isPending ||
                      preview.filter((r) => r.errors.length === 0).length === 0
                    }
                  />
                </>
              ) : null}

              {uploadedCount != null && uploadedCount > 0 ? (
                <>
                  <View style={styles.gapLg} />
                  <Card>
                    <Text variant="bodyM">
                      {uploadedCount} {uploadedCount === 1 ? "row" : "rows"}{" "}
                      uploaded.
                    </Text>
                    <View style={styles.gapSm} />
                    <Button
                      label="Publish results"
                      onPress={onPublish}
                      variant="hero"
                      size="lg"
                      fullWidth
                      loading={publishResults.isPending}
                      disabled={publishResults.isPending}
                    />
                  </Card>
                </>
              ) : null}
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  flex: { flex: 1 },
  scroll: { padding: theme.spacing.lg, paddingBottom: 120 },
  sectionLabel: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  gapSm: { height: theme.spacing.sm },
  gap: { height: theme.spacing.md },
  gapLg: { height: theme.spacing.xl },
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
  formatNote: { marginTop: theme.spacing.xs },
  error: { marginTop: theme.spacing.md },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  previewBody: { flex: 1 },
  previewMeta: { marginTop: theme.spacing.xxs },
});
