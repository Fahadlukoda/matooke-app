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
import { useCreateAnnouncement } from "@/hooks/useAdmin";
import { uploadEventPoster } from "@/lib/admin";
import type { AdminStackParamList } from "@/navigation/AdminStack";

type Props = NativeStackScreenProps<AdminStackParamList, "NewAnnouncement">;

type PickedImage = {
  uri: string;
  mimeType?: string | null;
};

export function NewAnnouncement({ navigation }: Props) {
  const createAnnouncement = useCreateAnnouncement();

  const [body, setBody] = useState("");
  const [image, setImage] = useState<PickedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Allow photo access to attach an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImage({ uri: asset.uri, mimeType: asset.mimeType ?? null });
    }
  }

  async function onSubmit() {
    setError(null);

    if (body.trim().length < 4) {
      setError("Write the announcement body.");
      return;
    }

    try {
      let imageUrl: string | null = null;
      if (image) {
        imageUrl = await uploadEventPoster(image);
      }
      await createAnnouncement.mutateAsync({ body: body.trim(), imageUrl });
      navigation.goBack();
    } catch {
      setError("Could not post. Check your connection and try again.");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScreenHeader
        title="New announcement"
        onBack={() => navigation.goBack()}
      />
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
            Announcement
          </Text>
          <Card>
            <TextField
              label="Message"
              placeholder="What does the club need to know?"
              value={body}
              onChangeText={setBody}
              multiline
              editable={!createAnnouncement.isPending}
            />

            <View style={styles.gapLg} />

            {image ? (
              <Image source={{ uri: image.uri }} style={styles.preview} />
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
                  Attach an image (optional)
                </Text>
              </Pressable>
            )}

            {image ? (
              <Pressable
                onPress={() => setImage(null)}
                hitSlop={8}
                style={styles.removeImage}
                accessibilityRole="button"
              >
                <Text variant="bodyS" color={theme.semantic.text.brand}>
                  Remove image
                </Text>
              </Pressable>
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
          </Card>

          <View style={styles.gapLg} />
          <Button
            label="Post announcement"
            onPress={onSubmit}
            variant="hero"
            size="lg"
            fullWidth
            loading={createAnnouncement.isPending}
            disabled={createAnnouncement.isPending}
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
  removeImage: { marginTop: theme.spacing.sm, alignSelf: "flex-start" },
  error: { marginTop: theme.spacing.md },
});
