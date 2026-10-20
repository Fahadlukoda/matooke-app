import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Chip } from '@/components/Chip';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { uploadAvatar, type PickedImage } from '@/lib/profile';
import { useAuthStore } from '@/state/auth';
import type { ProfileStackParamList } from '@/navigation/ProfileStack';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

export function EditProfile({ navigation }: Props) {
  const profileQuery = useProfile();
  const profile = profileQuery.data;
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState(profile?.full_name ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [level, setLevel] = useState<string | null>(profile?.level ?? null);
  const [avatar, setAvatar] = useState<PickedImage | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (profile && !name && !city && !level) {
      setName(profile.full_name);
      setCity(profile.city ?? '');
      setLevel(profile.level ?? null);
    }
  }, [profile, name, city, level]);

  async function pickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Allow photo access to change your avatar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAvatar({
        uri: asset.uri,
        mimeType: asset.mimeType ?? null,
        fileName: asset.fileName ?? null,
      });
    }
  }

  async function onSave() {
    setError(null);
    setSaved(false);

    if (!name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    if (!user) return;

    setSaving(true);
    try {
      let avatar_url: string | undefined;
      if (avatar) {
        avatar_url = await uploadAvatar(user.id, avatar);
      }

      await updateProfile.mutateAsync({
        full_name: name.trim(),
        city: city.trim() || null,
        level: (level as any) ?? null,
        ...(avatar_url ? { avatar_url } : {}),
      });

      setSaved(true);
    } catch {
      setError('Could not save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  const currentAvatar = avatar?.uri ?? profile?.avatar_url ?? null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Edit profile" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarRow}>
            <Pressable
              onPress={pickAvatar}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
            >
              {currentAvatar ? (
                <Image source={{ uri: currentAvatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarEmpty]}>
                  <Camera size={24} color={theme.textColors.matooke[700]} strokeWidth={2} />
                </View>
              )}
            </Pressable>
            <View style={styles.avatarCopy}>
              <Text variant="bodyM">Profile photo</Text>
              <Text variant="bodyS" color={theme.semantic.text.secondary}>
                Tap to change.
              </Text>
            </View>
          </View>

          <View style={styles.gap} />
          <TextField
            label="Full name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!saving}
          />

          <View style={styles.gap} />
          <TextField
            label="City"
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
            editable={!saving}
          />

          <View style={styles.gapLg} />
          <Text variant="caption" color={theme.semantic.text.secondary}>
            Running level
          </Text>
          <View style={styles.chipRow}>
            {LEVELS.map((l) => (
              <Chip
                key={l.value}
                label={l.label}
                selected={level === l.value}
                onPress={() => setLevel(l.value)}
              />
            ))}
          </View>

          {error ? (
            <Text variant="bodyS" color={theme.semantic.text.danger} style={styles.error}>
              {error}
            </Text>
          ) : null}
          {saved ? (
            <Text variant="bodyS" color={theme.semantic.text.brand} style={styles.error}>
              Saved.
            </Text>
          ) : null}

          <View style={styles.gapLg} />
          <Button
            label="Save changes"
            onPress={onSave}
            variant="primary"
            size="lg"
            fullWidth
            loading={saving}
            disabled={saving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  flex: { flex: 1 },
  scroll: { padding: theme.spacing.xl, paddingBottom: theme.spacing['2xl'] },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, marginRight: theme.spacing.md },
  avatarEmpty: {
    backgroundColor: theme.fills.matooke[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.fills.matooke[200],
  },
  avatarCopy: { flex: 1 },
  gap: { height: theme.spacing.md },
  gapLg: { height: theme.spacing.xl },
  chipRow: { flexDirection: 'row', gap: theme.spacing.xs, marginTop: theme.spacing.xs },
  error: { marginTop: theme.spacing.md },
});