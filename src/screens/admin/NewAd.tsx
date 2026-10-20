import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { ImageIcon } from "lucide-react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { theme } from "@/theme";
import { Text } from "@/components/Text";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { TextField } from "@/components/TextField";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useCreateAd } from "@/hooks/usePosts";
import { uploadRunPostImage } from "@/lib/posts";
import { useAuthStore } from "@/state/auth";
import type { AdminStackParamList } from "@/navigation/AdminStack";

type Props = NativeStackScreenProps<AdminStackParamList, "NewAd">;

export function NewAd({ navigation }: Props) {
  const createAd = useCreateAd();
  const user = useAuthStore((s) => s.user);

  const [body, setBody] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Allow photo access to attach an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageMime(result.assets[0].mimeType ?? null);
    }
  }

  async function onSubmit() {
    setError(null);

    if (body.trim().length < 4) {
      setError("Write the ad copy.");
      return;
    }
    if (!imageUri) {
      setError("An ad requires an image.");
      return;
    }
    if (!user) return;

    setUploading(true);
    try {
      const imageUrl = await uploadRunPostImage(user.id, imageUri, imageMime);
      await createAd.mutateAsync({ body: body.trim(), imageUrl });
      navigation.goBack();
    } catch {
      setError("Could not post the ad. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  const isBusy = uploading || createAd.isPending;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader title="New ad" onBack={() => navigation.goBack()} />
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
            Ad details
          </Text>
          <Card>
            <TextField
              label="Ad copy"
              placeholder="Describe the business or offer..."
              value={body}
              onChangeText={setBody}
              multiline
              editable={!isBusy}
            />
          </Card>

          <Text
            variant="caption"
            color={theme.semantic.text.secondary}
            style={styles.sectionLabel}
          >
            Image
          </Text>
          <Card>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.preview} />
            ) : (
              <Pressable
                onPress={pickImage}
                accessibilityRole="button"
                accessibilityLabel="Attach image"
                style={styles.imagePicker}
              >
                <ImageIcon
                  size={24}
                  color={theme.textColors.matooke[700]}
                  strokeWidth={2}
                />
                <Text
                  variant="bodyS"
                  color={theme.semantic.text.secondary}
                  style={styles.imageHint}
                >
                  Attach the ad image (required)
                </Text>
              </Pressable>
            )}
            {error ? (
              <Text
                variant="bodyS"
                color={theme.semantic.text.danger}
                style={styles.error}
              >
                {error}
              </Text>
            ) : null}
          </Card>

          <View style={styles.gapLg} />
          <Button
            label="Create ad"
            onPress={onSubmit}
            variant="hero"
            size="lg"
            fullWidth
            loading={isBusy}
            disabled={isBusy}
          />
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
  gapLg: { height: theme.spacing.xl },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing["2xl"],
    borderRadius: theme.radii.card,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: theme.fills.matooke[300],
    backgroundColor: theme.fills.matooke[100],
  },
  imageHint: { marginTop: theme.spacing.xs },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: theme.radii.card,
    backgroundColor: theme.fills.matooke[200],
  },
  error: { marginTop: theme.spacing.md },
});
