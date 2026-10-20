import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { OnboardingScaffold } from '@/components/OnboardingScaffold';
import { useUpdateProfile } from '@/hooks/useProfile';
import { useAuthStore } from '@/state/auth';
import { track } from '@/lib/analytics';
import type { OnboardingStackParamList } from '@/navigation/OnboardingStack';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Done'>;

export function Done(_props: Props) {
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFinish() {
    if (!user) return;
    setError(null);
    setSaving(true);
    try {
      await updateProfile.mutateAsync({
        onboarded_at: new Date().toISOString(),
      });
      track('onboarding_step_completed', { step: 'done' });
      track('onboarding_completed', { user_id: user.id });
      // RootNavigator observes profile.onboarded_at via useProfile in the router,
      // so this will swap to MainTabs automatically.
    } catch {
      setError('Could not finish. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <OnboardingScaffold
      step={4}
      title="You're in"
      subtitle="Your profile is set up. From here you can find training runs, register for Marathons, and track your runs."
      footer={
        <Button
          label="Start exploring"
          onPress={onFinish}
          variant="primary"
          size="lg"
          fullWidth
          loading={saving}
          disabled={saving}
        />
      }
    >
      <CheckCircle2
        size={44}
        color={theme.fills.matooke[600]}
        strokeWidth={1.75}
        style={styles.successIcon}
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
    </OnboardingScaffold>
  );
}

const styles = StyleSheet.create({
  successIcon: { alignSelf: 'center' },
  error: { marginTop: theme.spacing.md },
});