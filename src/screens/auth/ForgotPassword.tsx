import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { supabase } from '@/lib/supabase';
import { authErrorMessage } from '@/lib/errors';
import type { AuthStackParamList } from '@/navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPassword({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Enter the email you signed up with.');
      return;
    }

    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim()
    );

    setLoading(false);

    if (resetError) {
      setError(authErrorMessage(resetError));
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text variant="displayM">Check your email</Text>
          <Text
            variant="bodyM"
            color={theme.semantic.text.secondary}
            style={styles.centered_sub}
          >
            We sent a reset link to {email}. Follow it to set a new password.
          </Text>
          <View style={styles.gap} />
          <Button
            label="Back to sign in"
            onPress={() => navigation.navigate('SignIn')}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text variant="displayL">Reset password</Text>
          <Text
            variant="bodyM"
            color={theme.semantic.text.secondary}
            style={styles.sub}
          >
            Enter your email. We'll send a reset link.
          </Text>

          <View style={styles.form}>
            <TextField
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!loading}
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

            <View style={styles.gap} />
            <Button
              label="Send reset link"
              onPress={onSubmit}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
            />
            <View style={styles.gap} />
            <Button
              label="Back to sign in"
              onPress={() => navigation.navigate('SignIn')}
              variant="ghost"
              size="md"
              fullWidth
              disabled={loading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  flex: { flex: 1 },
  centered: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'center',
  },
  centered_sub: { marginTop: theme.spacing.md },
  scroll: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
  },
  sub: { marginTop: theme.spacing.xs },
  form: { marginTop: theme.spacing.xl },
  gap: { height: theme.spacing.md },
  error: { marginTop: theme.spacing.md },
});