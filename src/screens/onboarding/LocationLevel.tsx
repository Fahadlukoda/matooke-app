import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { OnboardingScaffold } from '@/components/OnboardingScaffold';
import { useUpdateProfile } from '@/hooks/useProfile';
import { track } from '@/lib/analytics';
import type { OnboardingStackParamList } from '@/navigation/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'LocationLevel'>;

const LEVELS = [
  { value: 'beginner', label: 'Beginner', blurb: 'New to running, or back after a long break.' },
  { value: 'intermediate', label: 'Intermediate', blurb: 'Running regularly. Comfortable with 10k.' },
  { value: 'advanced', label: 'Advanced', blurb: 'Racing. Comfortable with 21k and beyond.' },
] as const;

export function LocationLevel({ navigation }: Props) {
  const updateProfile = useUpdateProfile();
  const [city, setCity] = useState('');
  const [level, setLevel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onNext() {
    setError(null);

    if (!city.trim()) {
      setError('Enter your city.');
      return;
    }
    if (!level) {
      setError('Pick a running level.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        city: city.trim(),
        level: level as any,
      });
      track('onboarding_step_completed', { step: 'location_level' });
      navigation.navigate('Safety');
    } catch {
      setError('Could not save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingScaffold
      step={2}
      title="Where and how"
      subtitle="City helps us suggest nearby runs. Level helps us route you to the right group."
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
            label="City"
            placeholder="Kampala"
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
            editable={!saving}
          />

          <View style={styles.gapLg} />
          <Text variant="caption" color={theme.semantic.text.secondary}>
            Running level
          </Text>
          <View style={styles.levelList}>
            {LEVELS.map((l) => {
              const selected = level === l.value;
              return (
                <Pressable
                  key={l.value}
                  onPress={() => setLevel(l.value)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[
                    styles.levelCard,
                    {
                      backgroundColor: selected
                        ? theme.fills.matooke[100]
                        : theme.fills.paper,
                      borderColor: selected
                        ? theme.fills.matooke[500]
                        : theme.fills.matooke[200],
                    },
                  ]}
                >
                  <Text variant="bodyL" color={theme.semantic.text.primary}>
                    {l.label}
                  </Text>
                  <Text variant="bodyS" color={theme.semantic.text.secondary} style={styles.levelBlurb}>
                    {l.blurb}
                  </Text>
                </Pressable>
              );
            })}
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
  gapLg: { height: theme.spacing.xl },
  levelList: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
  levelCard: {
    padding: theme.spacing.lg,
    borderRadius: theme.radii.card,
    borderWidth: 1,
  },
  levelBlurb: { marginTop: theme.spacing.xxs },
  error: { marginTop: theme.spacing.md },
});