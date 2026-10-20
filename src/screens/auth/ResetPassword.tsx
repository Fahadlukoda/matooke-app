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

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPassword({ navigation }: Props) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({ password });

    setLoading(false);

    if (updateError) {
      setError(authErrorMessage(updateError));
      return;
    }

    navigation.navigate('SignIn');
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
          <Text variant="displayL">New password</Text>
          <Text
            variant="bodyM"
            color={theme.semantic.text.secondary}
            style={styles.sub}
          >
            Choose a new password. At least 8 characters.
          </Text>

          <View style={styles.form}>
            <TextField
              label="New password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              textContentType="newPassword"
              editable={!loading}
            />
            <View style={styles.gap} />
            <TextField
              label="Confirm new password"
              value={confirm}
              onChangeText={setConfirm}
              secureTextEntry
              autoCapitalize="none"
              textContentType="newPassword"
              editable={!loading}
              error={confirm.length > 0 && confirm !== password ? 'Passwords do not match.' : undefined}
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
              label="Update password"
              onPress={onSubmit}
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
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
  scroll: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
  },
  sub: { marginTop: theme.spacing.xs },
  form: { marginTop: theme.spacing.xl },
  gap: { height: theme.spacing.md },
  error: { marginTop: theme.spacing.md },
});