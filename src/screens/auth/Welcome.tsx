import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Scrim } from '@/components/Scrim';
import { images } from '@/lib/images';
import { track } from '@/lib/analytics';
import type { AuthStackParamList } from '@/navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export function Welcome({ navigation }: Props) {
  React.useEffect(() => {
    track('screen_viewed', { screen: 'Welcome' });
  }, []);

  return (
    <View style={styles.root}>
      <Image
        source={images.welcomeHero}
        style={[StyleSheet.absoluteFill, styles.backgroundImage]}
        resizeMode="cover"
      />
      <Scrim position="bottom" height="60%" intensity={0.85} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.heroContent}>
          <Text variant="displayXL" color={theme.textColors.paper} style={styles.headline}>
            We Run Kampala.
          </Text>
          <Text
            variant="bodyL"
            color="rgba(251,251,247,0.85)"
            style={styles.sub}
          >
            The club in your pocket. Training runs, Marathons, your runs
            tracked, results posted.
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Create account"
            onPress={() => navigation.navigate('SignUp')}
            variant="primary"
            size="lg"
            fullWidth
          />
          <View style={styles.spacer} />
          <Button
            label="Sign in"
            onPress={() => navigation.navigate('SignIn')}
            variant="secondary"
            size="lg"
            fullWidth
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.semantic.bg.page,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  safe: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  heroContent: {
    marginTop: 'auto',
    marginBottom: theme.spacing['3xl'],
  },
  headline: {
    fontSize: 44,
    lineHeight: 46,
    letterSpacing: -0.8,
  },
  sub: {
    marginTop: theme.spacing.md,
    maxWidth: 320,
  },
  actions: {
    paddingBottom: theme.spacing.lg,
  },
  spacer: {
    height: theme.spacing.sm,
  },
});