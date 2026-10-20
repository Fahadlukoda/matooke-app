import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Lock, Mail } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Scrim } from '@/components/Scrim';
import { supabase } from '@/lib/supabase';
import { authErrorMessage } from '@/lib/errors';
import { track } from '@/lib/analytics';
import { images } from '@/lib/images';
import type { AuthStackParamList } from '@/navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUp({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    track('signup_started', { method: 'email' });

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(authErrorMessage(signUpError));
      return;
    }
    if (data.user) {
      track('signup_completed', { user_id: data.user.id });
    }
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.heroContainer, { paddingTop: insets.top + theme.spacing.md }]}>
            <Image
              source={images.finalHero}
              style={[StyleSheet.absoluteFill, styles.heroImage]}
              resizeMode="cover"
            />
            <Scrim position="bottom" height="100%" intensity={0.4} />
            <View style={styles.brandRow}>
              <View style={styles.logoWrap}>
                <Image
                  source={images.logo}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <View style={styles.logoOverlay} />
              </View>
              <Text
                variant="bodyL"
                color={theme.textColors.paper}
                style={styles.brandText}
              >
                Team Matooke
              </Text>
            </View>
            <View style={styles.heroText}>
              <Text variant="displayL" color={theme.textColors.paper}>
                Create account
              </Text>
              <Text
                variant="bodyM"
                color="rgba(251,251,247,0.85)"
                style={styles.heroSubtitle}
              >
                Join the club. Two minutes and you're in.
              </Text>
            </View>
          </View>

          <View style={styles.contentCard}>
            <View style={styles.form}>
              <TextField
                label="Email"
                labelIcon={<Mail size={14} color={theme.semantic.text.secondary} strokeWidth={2} />}
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                editable={!loading}
              />
              <View style={styles.gap} />
              <TextField
                label="Password"
                labelIcon={<Lock size={14} color={theme.semantic.text.secondary} strokeWidth={2} />}
                placeholder="At least 8 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
                editable={!loading}
                helper="Use 8 characters or more."
              />
              <View style={styles.gap} />
              <TextField
                label="Confirm password"
                labelIcon={<Lock size={14} color={theme.semantic.text.secondary} strokeWidth={2} />}
                placeholder="Repeat password"
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
                editable={!loading}
                error={
                  confirm.length > 0 && confirm !== password
                    ? 'Passwords do not match.'
                    : undefined
                }
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

              <Button
                label="Create account"
                onPress={onSubmit}
                variant="hero"
                size="lg"
                fullWidth
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
              />
            </View>

            <View style={styles.footer}>
              <Text
                variant="bodyS"
                color={theme.semantic.text.secondary}
                align="center"
              >
                Already have an account?
              </Text>
              <View style={styles.gapSm} />
              <Button
                label="Sign in instead"
                onPress={() => navigation.navigate('SignIn')}
                variant="secondary"
                size="md"
                fullWidth
                disabled={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.semantic.bg.page },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  heroContainer: {
    height: 280,
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    justifyContent: 'flex-start',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
  },
  logo: { width: 32, height: 32, borderRadius: 16 },
  logoOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  brandText: { fontWeight: '600' },
  heroText: { marginTop: theme.spacing['2xl'] },
  heroSubtitle: { marginTop: theme.spacing.xs },
  contentCard: {
    marginTop: -32,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: 120,
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: theme.fills.paper,
  },
  form: {},
  gap: { height: theme.spacing.md },
  gapSm: { height: theme.spacing.xs },
  error: { marginTop: theme.spacing.md },
  submitButton: { marginTop: theme.spacing.lg },
  footer: { marginTop: theme.spacing['3xl'] },
});
