import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import type { ProfileStackParamList } from '@/navigation/ProfileStack';

type Props = NativeStackScreenProps<ProfileStackParamList, 'PrivateDetails'>;

export function PrivateDetails({ navigation }: Props) {
  const profileQuery = useProfile();
  const profile = profileQuery.data;
  const updateProfile = useUpdateProfile();

  const [emergencyName, setEmergencyName] = useState(profile?.emergency_name ?? '');
  const [emergencyPhone, setEmergencyPhone] = useState(profile?.emergency_phone ?? '');
  const [medicalNotes, setMedicalNotes] = useState(profile?.medical_notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (profile && !emergencyName && !emergencyPhone && !medicalNotes) {
      setEmergencyName(profile.emergency_name ?? '');
      setEmergencyPhone(profile.emergency_phone ?? '');
      setMedicalNotes(profile.medical_notes ?? '');
    }
  }, [profile, emergencyName, emergencyPhone, medicalNotes]);

  async function onSave() {
    setError(null);
    setSaved(false);

    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      setError('Emergency contact name and phone are required.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        emergency_name: emergencyName.trim(),
        emergency_phone: emergencyPhone.trim(),
        medical_notes: medicalNotes.trim() || null,
      });
      setSaved(true);
    } catch {
      setError('Could not save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Private details" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text variant="bodyS" color={theme.semantic.text.secondary}>
            Only you and club captains can see this. It's used if something happens on a run.
          </Text>

          <View style={styles.gapLg} />
          <TextField
            label="Emergency contact name"
            value={emergencyName}
            onChangeText={setEmergencyName}
            autoCapitalize="words"
            editable={!saving}
          />
          <View style={styles.gap} />
          <TextField
            label="Emergency contact phone"
            value={emergencyPhone}
            onChangeText={setEmergencyPhone}
            keyboardType="phone-pad"
            editable={!saving}
          />
          <View style={styles.gap} />
          <TextField
            label="Medical notes"
            value={medicalNotes}
            onChangeText={setMedicalNotes}
            multiline
            editable={!saving}
            placeholder="Asthma, allergies, anything a first responder should know."
          />

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
            label="Save"
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
  gap: { height: theme.spacing.md },
  gapLg: { height: theme.spacing.xl },
  error: { marginTop: theme.spacing.md },
});