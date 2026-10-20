import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { supabase } from '@/lib/supabase';
import { authErrorMessage } from '@/lib/errors';
import type { AuthStackParamList } from '@/navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

export function VerifyEmail({ route, navigation }: Props) {
  const email = route.params?.email ?? '';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function onResend() {
    if (!email) return;
    setError(null);
    setLoading(true);

    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    setLoading(false);

    if (resendError) {
      setError(authErrorMessage(resendError));
      return;
    }
    setResent(true);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.centered}>
        <Text variant="displayM">Confirm your email</Text>
        <Text
          variant="bodyM"
          color={theme.semantic.text.secondary}
          style={styles.sub}
        >
          We sent a confirmation link to {email}. Click it to activate your account.
        </Text>

        {error ? (
          <Text
            variant="bodyS"
            color={theme.semantic.text.danger}
            style={styles.error}
          >
            {error}
          </Text>
        ) : null}

        {resent ? (
          <Text
            variant="bodyS"
            color={theme.semantic.text.brand}
            style={styles.error}
          >
            Sent. Check your inbox again.
          </Text>
        ) : null}

        <View style={styles.gap} />
        <Button
          label="Resend confirmation email"
          onPress={onResend}
          variant="secondary"
          size="lg"
          fullWidth
          loading={loading}
          disabled={loading || !email}
        />
        <View style={styles.gap} />
        <Button
          label="Back to sign in"
          onPress={() => navigation.navigate('SignIn')}
          variant="ghost"
          size="md"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  centered: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  sub: { marginTop: theme.spacing.md },
  error: { marginTop: theme.spacing.md },
  gap: { height: theme.spacing.md },
});