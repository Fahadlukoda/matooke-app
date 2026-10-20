import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  TextInput,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Camera } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { StatGrid } from "@/components/StatGrid";
import { LiveRouteMap } from "@/components/LiveRouteMap";
import { useRunStore } from "@/lib/run-store";
import { computeCaloriesEstimate } from "@/lib/run-tracker";
import { useAuthStore } from "@/state/auth";
import { useQueryClient } from "@tanstack/react-query";
import { enqueueRun, trySyncNow } from "@/lib/offline-queue";
import { myRunsKey } from "@/hooks/useRuns";
import { useCreateRunPost, feedKey } from "@/hooks/usePosts";
import { uploadRunPostImage } from "@/lib/posts";
import { formatDuration, formatPace, formatDistanceKm } from "@/hooks/useRun";
import { track } from "@/lib/analytics";
import type { RunStackParamList } from "@/navigation/RunStack";

type Props = NativeStackScreenProps<RunStackParamList, "RunSummary">;

type Visibility = "private" | "club";
type SaveState = "idle" | "saving" | "saved" | "queued";

export function RunSummary({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const snapshot = useRunStore((s) => s.snapshot);
  const status = useRunStore((s) => s.status);
  const discardRun = useRunStore((s) => s.discard);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const createRunPost = useCreateRunPost();

  const [visibility, setVisibility] = useState<Visibility>("private");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);

  const durationMs =
    snapshot.startedAt != null && snapshot.endedAt != null
      ? snapshot.endedAt - snapshot.startedAt - snapshot.pausedTotalMs
      : 0;

  const avgPace =
    snapshot.distanceM > 50 && durationMs > 0
      ? Math.round((durationMs / 1000 / snapshot.distanceM) * 1000)
      : null;

  const calories = computeCaloriesEstimate(snapshot.distanceM, durationMs);
  const mapHeight = windowHeight * 0.58 + insets.top;
  const sheetTop = windowHeight * 0.55;

  if (status !== "finished") {
    navigation.popToTop();
    return null;
  }

  async function handleTakePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setError("Camera access is required to take a snap.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageMime(result.assets[0].mimeType ?? null);
    }
  }

  async function onSave() {
    if (!user || snapshot.startedAt == null || snapshot.endedAt == null) return;

    if (visibility === "club" && !imageUri) {
      setError("Take a snap to share your run with the club.");
      return;
    }

    setSaveState("saving");
    setError(null);

    const payload = {
      client_id: snapshot.clientId,
      event_id: snapshot.eventId,
      started_at: new Date(snapshot.startedAt).toISOString(),
      ended_at: new Date(snapshot.endedAt).toISOString(),
      distance_m: Math.round(snapshot.distanceM),
      duration_s: Math.round(durationMs / 1000),
      avg_pace_s: avgPace,
      steps: snapshot.steps,
      calories,
      route: snapshot.route,
      visibility,
    };

    const result = await trySyncNow({
      authUserId: user.id,
      payload,
    });

    if (result.synced && result.run) {
      track("run_saved", {
        run_id: result.run.id,
        visibility,
      });
      queryClient.invalidateQueries({ queryKey: myRunsKey });

      if (visibility === "club" && imageUri) {
        try {
          const imageUrl = await uploadRunPostImage(
            user.id,
            imageUri,
            imageMime,
          );
          const post = await createRunPost.mutateAsync({
            runId: result.run.id,
            body: caption.trim(),
            imageUrl,
          });
          track("post_created", { type: "run", post_id: post.id });
          queryClient.invalidateQueries({ queryKey: feedKey });
        } catch (e) {
          setError("Run saved, but the post could not be uploaded.");
        }
      }

      setSaveState("saved");
    } else {
      await enqueueRun({
        authUserId: user.id,
        payload,
      });
      setSaveState("queued");
    }
  }

  function onDiscard() {
    discardRun();
    navigation.popToTop();
  }

  function onDone() {
    discardRun();
    navigation.popToTop();
  }

  return (
    <View style={styles.root}>
      <View style={[styles.mapWrap, { height: mapHeight }]}>
        <LiveRouteMap
          route={snapshot.route}
          style={styles.map}
          strokeColor={theme.textColors.ink[900]}
        />
      </View>

      <ScrollView
        style={[styles.sheet, { top: sheetTop }]}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.grabber} />
        <Text variant="displayL">Run complete</Text>
        <Text
          variant="bodyM"
          color={theme.semantic.text.secondary}
          style={styles.sub}
        >
          {saveState === "saved"
            ? "Saved to your profile."
            : saveState === "queued"
              ? "No connection. Saved locally and will sync automatically."
              : "Review your run and save it to your profile."}
        </Text>

        <View style={styles.gapLg} />

        <Card>
          <StatGrid
            columns={2}
            cells={[
              {
                label: "Distance",
                value: `${formatDistanceKm(snapshot.distanceM)} km`,
              },
              { label: "Time", value: formatDuration(durationMs) },
              {
                label: "Avg pace",
                value: avgPace ? formatPace(avgPace) : "—:—",
              },
              { label: "Steps", value: snapshot.steps.toString() },
              { label: "Calories", value: `${calories} kcal` },
            ]}
          />
        </Card>

        {saveState === "idle" ? (
          <>
            <View style={styles.gapLg} />
            <Text variant="caption" color={theme.semantic.text.secondary}>
              Visibility
            </Text>
            <View style={styles.visRow}>
              <Chip
                label="Private"
                selected={visibility === "private"}
                onPress={() => setVisibility("private")}
              />
              <Chip
                label="Share with club"
                selected={visibility === "club"}
                onPress={() => setVisibility("club")}
              />
            </View>

            {visibility === "club" ? (
              <View style={styles.shareSection}>
                <Text variant="bodyS" color={theme.semantic.text.secondary}>
                  To share a run, you must take one snap. This is your post.
                </Text>

                {imageUri ? (
                  <View style={styles.imagePreviewWrap}>
                    <Image
                      source={{ uri: imageUri }}
                      style={styles.imagePreview}
                    />
                    <Pressable
                      onPress={() => setImageUri(null)}
                      style={styles.removeImage}
                    >
                      <Text variant="bodyS" color={theme.semantic.text.danger}>
                        Retake
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable
                    onPress={handleTakePhoto}
                    style={styles.takePhotoBtn}
                  >
                    <Camera
                      size={24}
                      color={theme.textColors.paper}
                      strokeWidth={2}
                    />
                    <Text
                      variant="bodyM"
                      color={theme.textColors.paper}
                      style={styles.takePhotoText}
                    >
                      Take a snap
                    </Text>
                  </Pressable>
                )}

                {imageUri ? (
                  <View style={{ marginTop: theme.spacing.md }}>
                    <Text
                      variant="caption"
                      color={theme.semantic.text.secondary}
                      style={{ marginBottom: 4 }}
                    >
                      Caption (optional)
                    </Text>
                    <TextInput
                      value={caption}
                      onChangeText={setCaption}
                      placeholder="Say something about the run…"
                      placeholderTextColor={theme.textColors.ink[300]}
                      multiline
                      style={{
                        fontFamily: theme.fonts.body,
                        fontSize: 15,
                        lineHeight: 22,
                        color: theme.textColors.ink[900],
                        backgroundColor: theme.fills.paper,
                        borderRadius: theme.radii.input,
                        padding: theme.spacing.sm,
                        minHeight: 60,
                        textAlignVertical: "top",
                      }}
                    />
                  </View>
                ) : null}
              </View>
            ) : null}
          </>
        ) : null}

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

        {saveState === "saved" || saveState === "queued" ? (
          <Button
            label="Done"
            onPress={onDone}
            variant="primary"
            size="lg"
            fullWidth
          />
        ) : (
          <>
            <Button
              label={saveState === "saving" ? "Saving…" : "Save run"}
              onPress={onSave}
              variant="hero"
              size="lg"
              fullWidth
              loading={saveState === "saving"}
              disabled={saveState === "saving"}
            />
            <View style={styles.gapMd} />
            <Button
              label="Discard"
              onPress={onDiscard}
              variant="ghost"
              size="md"
              fullWidth
              disabled={saveState === "saving"}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.semantic.bg.page },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: 120,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.semantic.bg.page,
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    overflow: "hidden",
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.fills.ink[300],
    alignSelf: "center",
    marginBottom: theme.spacing.sm,
  },
  sub: { marginTop: theme.spacing.xs },
  gapLg: { height: theme.spacing.xl },
  gapMd: { height: theme.spacing.md },
  mapWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  map: { flex: 1 },
  visRow: {
    flexDirection: "row",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  shareSection: { marginTop: theme.spacing.md },
  takePhotoBtn: {
    backgroundColor: theme.fills.matooke[500],
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: theme.spacing.md,
    borderRadius: theme.radii.button,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  takePhotoText: { color: theme.textColors.paper },
  imagePreviewWrap: { marginTop: theme.spacing.md },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: theme.radii.card,
    backgroundColor: theme.fills.matooke[200],
  },
  removeImage: { marginTop: theme.spacing.xs, alignSelf: "flex-end" },
  error: { marginTop: theme.spacing.md },
});
