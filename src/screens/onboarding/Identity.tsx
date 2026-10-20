import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Chip } from '@/components/Chip';
import { OnboardingScaffold } from '@/components/OnboardingScaffold';
import { useUpdateProfile } from '@/hooks/useProfile';
import { uploadAvatar, computeBirthdateISO, type PickedImage } from '@/lib/profile';
import { useAuthStore } from '@/state/auth';
import { track } from '@/lib/analytics';
import type { OnboardingStackParamList } from '@/navigation/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Identity'>;

const GENDERS = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
] as const;

export function Identity({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<PickedImage | null>(null);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function pickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Allow photo access to upload an avatar.');
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

  async function onNext() {
    setError(null);

    if (!name.trim()) {
      setError('Enter your name.');
      return;
    }
    if (!user) {
      setError('Not signed in.');
      return;
    }

    const birthdate = computeBirthdateISO(day, month, year);
    if ((day || month || year) && !birthdate) {
      setError('Check the birthdate. Day, month, year.');
      return;
    }

    setSaving(true);

    try {
      let avatarUrl: string | undefined;
      if (avatar) {
        avatarUrl = await uploadAvatar(user.id, avatar);
      }

      await updateProfile.mutateAsync({
        full_name: name.trim(),
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        ...(birthdate ? { birthdate } : {}),
        ...(gender ? { gender: gender as any } : {}),
      });

      track('onboarding_step_completed', { step: 'identity' });
      navigation.navigate('LocationLevel');
    } catch (e) {
      setError('Could not save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingScaffold
      step={1}
      title="About you"
      subtitle="Tell us who you are. Name and photo are visible to members; birthdate and gender stay private."
      footer={
        <Button
          label="Continue"
          onPress={onNext}
          variant="primary"
          size="lg"
          fullWidth
          loading={saving}
          disabled={saving}
        />
      }
    >
          <View style={styles.avatarRow}>
            <Pressable
              onPress={pickAvatar}
              accessibilityRole="button"
              accessibilityLabel="Choose profile photo"
              style={styles.avatarPress}
            >
              {avatar ? (
                <Image source={{ uri: avatar.uri }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarEmpty]}>
                  <Camera size={24} color={theme.textColors.matooke[700]} strokeWidth={2} />
                </View>
              )}
            </Pressable>
            <View style={styles.avatarCopy}>
              <Text variant="bodyM">Profile photo</Text>
              <Text variant="bodyS" color={theme.semantic.text.secondary}>
                Optional. Square works best.
              </Text>
            </View>
          </View>

          <View style={styles.gap} />
          <TextField
            label="Full name"
            placeholder="Amina Kigongo"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!saving}
          />

          <View style={styles.gap} />
          <Text variant="caption" color={theme.semantic.text.secondary}>
            Birthdate
          </Text>
          <View style={styles.dateRow}>
            <View style={styles.dateCell}>
              <TextField placeholder="DD" value={day} onChangeText={setDay} keyboardType="number-pad" maxLength={2} editable={!saving} />
            </View>
            <View style={styles.dateCell}>
              <TextField placeholder="MM" value={month} onChangeText={setMonth} keyboardType="number-pad" maxLength={2} editable={!saving} />
            </View>
            <View style={[styles.dateCell, styles.dateCellWide]}>
              <TextField placeholder="YYYY" value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} editable={!saving} />
            </View>
          </View>

          <View style={styles.gap} />
          <Text variant="caption" color={theme.semantic.text.secondary}>
            Gender
          </Text>
          <View style={styles.chipRow}>
            {GENDERS.map((g) => (
              <Chip
                key={g.value}
                label={g.label}
                selected={gender === g.value}
                onPress={() => setGender(g.value)}
              />
            ))}
          </View>

          {error ? (
            <Text variant="bodyS" color={theme.semantic.text.danger} style={styles.error}>
              {error}
            </Text>
          ) : null}
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarPress: { marginRight: theme.spacing.md },
  avatar: { width: 80, height: 80, borderRadius: 40 },
  avatarEmpty: {
    backgroundColor: theme.fills.matooke[100],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.fills.matooke[200],
  },
  avatarCopy: { flex: 1 },
  dateRow: { flexDirection: 'row', gap: theme.spacing.sm, marginTop: theme.spacing.xs },
  dateCell: { flex: 1 },
  dateCellWide: { flex: 1.6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs, marginTop: theme.spacing.xs },
  gap: { height: theme.spacing.md },
  error: { marginTop: theme.spacing.md },
});