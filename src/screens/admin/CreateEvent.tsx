import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { ImageIcon } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { Chip } from "@/components/Chip";
import { Card } from "@/components/Card";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useCreateEvent, useUploadEventPoster } from "@/hooks/useAdmin";
import type { AdminStackParamList } from "@/navigation/AdminStack";

type Props = NativeStackScreenProps<AdminStackParamList, "CreateEvent">;

type PickedImage = { uri: string; mimeType?: string | null };

const DISTANCE_OPTIONS = [5, 10, 15, 21, 25, 42];

export function CreateEvent({ navigation }: Props) {
  const createEvent = useCreateEvent();
  const uploadPoster = useUploadEventPoster();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"marathon" | "training">("training");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [venueName, setVenueName] = useState("");
  const [venueLat, setVenueLat] = useState("");
  const [venueLng, setVenueLng] = useState("");
  const [distances, setDistances] = useState<number[]>([5]);
  const [capacity, setCapacity] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [entryFee, setEntryFee] = useState("");
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleDistance(d: number) {
    setDistances((cur) =>
      cur.includes(d)
        ? cur.filter((x) => x !== d)
        : [...cur, d].sort((a, b) => a - b),
    );
  }

  async function pickPoster() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Allow photo access to upload a poster.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 2],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPosterPreview(asset.uri);
    }
  }

  async function onSave() {
    setError(null);

    if (!title.trim()) return setError("Title is required.");
    if (!venueName.trim()) return setError("Venue is required.");
    if (!dateStr.trim()) return setError("Date is required (YYYY-MM-DD).");
    if (!timeStr.trim()) return setError("Start time is required (HH:MM).");
    if (distances.length === 0) return setError("Pick at least one distance.");
    if (isPaid) {
      const fee = parseInt(entryFee, 10);
      if (!Number.isFinite(fee) || fee <= 0) {
        return setError("Enter the entry fee in UGX.");
      }
    }

    const startAt = parseLocalDateTime(dateStr, timeStr);
    if (!startAt) return setError("Check the date and time format.");

    const cap = capacity.trim() ? parseInt(capacity, 10) : null;
    const lat = venueLat.trim() ? parseFloat(venueLat) : null;
    const lng = venueLng.trim() ? parseFloat(venueLng) : null;

    try {
      let finalPosterUrl = posterUrl;
      if (posterPreview && !finalPosterUrl) {
        finalPosterUrl = await uploadPoster.mutateAsync({
          uri: posterPreview,
        });
      }

      await createEvent.mutateAsync({
        title: title.trim(),
        description: description.trim() || null,
        type,
        start_at: startAt,
        end_at: null,
        venue_name: venueName.trim(),
        venue_lat: lat != null && Number.isFinite(lat) ? lat : null,
        venue_lng: lng != null && Number.isFinite(lng) ? lng : null,
        poster_url: finalPosterUrl,
        is_paid: isPaid,
        entry_fee_ugx: isPaid ? parseInt(entryFee, 10) : null,
        distances_km: distances,
        capacity: cap != null && Number.isFinite(cap) ? cap : null,
      });

      navigation.goBack();
    } catch (e) {
      setError("Could not create event. Check your connection and try again.");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="Create event" onBack={() => navigation.goBack()} />
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
            Event details
          </Text>
          <Card>
            <Text variant="caption" color={theme.semantic.text.secondary}>
              Type
            </Text>
            <View style={styles.chipRow}>
              <Chip
                label="Training run"
                selected={type === "training"}
                onPress={() => setType("training")}
              />
              <Chip
                label="Marathon"
                selected={type === "marathon"}
                onPress={() => setType("marathon")}
              />
            </View>

            <View style={styles.gap} />
            <TextField
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="Saturday Community Run — Kololo"
            />

            <View style={styles.gap} />
            <TextField
              label="Description"
              value={description}
              onChangeText={setDescription}
              multiline
              placeholder="Short summary of the run."
            />

            <View style={styles.gap} />
            <TextField
              label="Date (YYYY-MM-DD)"
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="2026-03-21"
              keyboardType="numbers-and-punctuation"
            />
            <View style={styles.gap} />
            <TextField
              label="Start time (HH:MM, 24h)"
              value={timeStr}
              onChangeText={setTimeStr}
              placeholder="06:30"
              keyboardType="numbers-and-punctuation"
            />
          </Card>
          <Text
            variant="caption"
            color={theme.semantic.text.secondary}
            style={styles.sectionLabel}
          >
            Location &amp; pricing
          </Text>
          <Card>
            <View style={styles.gap} />
            <TextField
              label="Venue"
              value={venueName}
              onChangeText={setVenueName}
              placeholder="Kololo Airstrip, Kampala"
            />
            <View style={styles.gap} />
            <View style={styles.row}>
              <View style={styles.half}>
                <TextField
                  label="Latitude"
                  value={venueLat}
                  onChangeText={setVenueLat}
                  keyboardType="numbers-and-punctuation"
                  placeholder="0.3365"
                />
              </View>
              <View style={styles.half}>
                <TextField
                  label="Longitude"
                  value={venueLng}
                  onChangeText={setVenueLng}
                  keyboardType="numbers-and-punctuation"
                  placeholder="32.5950"
                />
              </View>
            </View>

            <View style={styles.gap} />
            <Text variant="caption" color={theme.semantic.text.secondary}>
              Distances
            </Text>
            <View style={styles.chipRow}>
              {DISTANCE_OPTIONS.map((d) => (
                <Chip
                  key={d}
                  label={`${d}k`}
                  selected={distances.includes(d)}
                  onPress={() => toggleDistance(d)}
                />
              ))}
            </View>

            <View style={styles.gap} />
            <TextField
              label="Capacity (optional)"
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="number-pad"
              placeholder="80"
            />

            <View style={styles.gapLg} />
            <Text variant="caption" color={theme.semantic.text.secondary}>
              Pricing
            </Text>
            <View style={styles.chipRow}>
              <Chip
                label="Free"
                selected={!isPaid}
                onPress={() => setIsPaid(false)}
              />
              <Chip
                label="Paid"
                selected={isPaid}
                onPress={() => setIsPaid(true)}
              />
            </View>
            {isPaid ? (
              <>
                <View style={styles.gap} />
                <TextField
                  label="Entry fee (UGX)"
                  value={entryFee}
                  onChangeText={setEntryFee}
                  keyboardType="number-pad"
                  placeholder="50000"
                />
              </>
            ) : null}
          </Card>
          <Text
            variant="caption"
            color={theme.semantic.text.secondary}
            style={styles.sectionLabel}
          >
            Poster
          </Text>
          <Card>
            {posterPreview ? (
              <>
                <Image source={{ uri: posterPreview }} style={styles.poster} />
                <Pressable
                  onPress={() => setPosterPreview(null)}
                  hitSlop={8}
                  style={styles.removePoster}
                >
                  <Text variant="bodyS" color={theme.semantic.text.brand}>
                    Remove poster
                  </Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                onPress={pickPoster}
                accessibilityRole="button"
                style={styles.posterPicker}
              >
                <ImageIcon
                  size={24}
                  color={theme.textColors.matooke[700]}
                  strokeWidth={2}
                />
                <Text
                  variant="bodyS"
                  color={theme.semantic.text.secondary}
                  style={styles.posterHint}
                >
                  Pick a poster image (optional)
                </Text>
              </Pressable>
            )}
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

          <View style={styles.gapLg} />
          <Button
            label="Create event"
            onPress={onSave}
            variant="hero"
            size="lg"
            fullWidth
            loading={createEvent.isPending || uploadPoster.isPending}
            disabled={createEvent.isPending || uploadPoster.isPending}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function parseLocalDateTime(dateStr: string, timeStr: string): string | null {
  const d = dateStr.trim();
  const t = timeStr.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  if (!/^\d{1,2}:\d{2}$/.test(t)) return null;

  const dateParts = d.split("-").map((s) => parseInt(s, 10));
  const timeParts = t.split(":").map((s) => parseInt(s, 10));

  if (dateParts.length !== 3 || timeParts.length !== 2) return null;

  const y = dateParts[0] as number;
  const m = dateParts[1] as number;
  const day = dateParts[2] as number;
  const hh = timeParts[0] as number;
  const mm = timeParts[1] as number;

  if (
    !Number.isFinite(y) ||
    !Number.isFinite(m) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hh) ||
    !Number.isFinite(mm)
  ) {
    return null;
  }
  if (
    m < 1 ||
    m > 12 ||
    day < 1 ||
    day > 31 ||
    hh < 0 ||
    hh > 23 ||
    mm < 0 ||
    mm > 59
  ) {
    return null;
  }

  const date = new Date(Date.UTC(y, m - 1, day, hh, mm, 0));
  return date.toISOString();
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
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  row: { flexDirection: "row", gap: theme.spacing.md },
  half: { flex: 1 },
  gap: { height: theme.spacing.md },
  gapLg: { height: theme.spacing.xl },
  posterPicker: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing["2xl"],
    marginTop: theme.spacing.sm,
    borderRadius: theme.radii.card,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.fills.matooke[300],
    backgroundColor: theme.fills.matooke[100],
  },
  posterHint: { marginTop: theme.spacing.xs },
  poster: {
    width: "100%",
    height: 200,
    borderRadius: theme.radii.card,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.fills.matooke[200],
  },
  removePoster: { marginTop: theme.spacing.sm, alignSelf: "flex-start" },
  error: { marginTop: theme.spacing.md },
});
