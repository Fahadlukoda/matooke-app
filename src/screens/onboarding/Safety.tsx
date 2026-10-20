import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { OnboardingScaffold } from '@/components/OnboardingScaffold';
import { useUpdateProfile } from '@/hooks/useProfile';
import { track } from '@/lib/analytics';
import type { OnboardingStackParamList } from '@/navigation/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Safety'>;

export function Safety({ navigation }: Props) {
  const updateProfile = useUpdateProfile();
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onNext() {
    setError(null);

    if (!emergencyName.trim() || !emergencyPhone.trim()) {
      setError('Emergency contact name and phone are required.');
      return;
    }
    if (emergencyPhone.replace(/\D/g, '').length < 9) {
      setError('Emergency phone looks too short. Include the country code or full local number.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        emergency_name: emergencyName.trim(),
        emergency_phone: emergencyPhone.trim(),
        medical_notes: medicalNotes.trim() || null,
      });
      track('onboarding_step_completed', { step: 'safety' });
      navigation.navigate('Done');
    } catch {
      setError('Could not save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingScaffold
      step={3}
      title="Safety"
      subtitle="If something happens on a run, this is who we call. Only you and club captains see it."
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
          <TextField
            label="Emergency contact name"
            placeholder="Next of kin"
            value={emergencyName}
            onChangeText={setEmergencyName}
            autoCapitalize="words"
            editable={!saving}
          />
          <View style={styles.gap} />
          <TextField
            label="Emergency contact phone"
            placeholder="+256 7xx xxx xxx"
            value={emergencyPhone}
            onChangeText={setEmergencyPhone}
            keyboardType="phone-pad"
            editable={!saving}
            helper="Include the country code if they're outside Uganda."
          />

          <View style={styles.gapLg} />
          <TextField
            label="Medical notes (optional)"
            placeholder="Asthma, allergies, anything a first responder should know."
            value={medicalNotes}
            onChangeText={setMedicalNotes}
            multiline
            editable={!saving}
          />

          {error ? (
            <Text variant="bodyS" color={theme.semantic.text.danger} style={styles.error}>
              {error}
            </Text>
          ) : null}
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  gap: { height: theme.spacing.md },
  gapLg: { height: theme.spacing.xl },
  error: { marginTop: theme.spacing.md },
});