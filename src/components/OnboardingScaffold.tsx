import React from 'react';
import {
  View,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';

import { theme } from '@/theme';
import { Text } from './Text';
import { images } from '@/lib/images';

type Props = {
  step: 1 | 2 | 3 | 4;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function OnboardingScaffold({
  step,
  title,
  subtitle,
  children,
  footer,
}: Props) {
  return (
    <View style={styles.root}>
      <Image
        source={images.onboardingBg}
        style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
        resizeMode="cover"
      />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.stepperRow}>
              {[1, 2, 3, 4].map((index) => (
                <View
                  key={index}
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor:
                        index <= step
                          ? theme.fills.matooke[500]
                          : 'rgba(23,24,26,0.15)',
                      width: index === step ? 24 : 8,
                    },
                  ]}
                />
              ))}
            </View>

            <Text
              variant="displayL"
              color={theme.textColors.ink[900]}
              style={styles.title}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                variant="bodyM"
                color={theme.semantic.text.secondary}
                style={styles.subtitle}
              >
                {subtitle}
              </Text>
            ) : null}

            <View style={styles.glassWrap}>
              <BlurView
                intensity={40}
                tint="light"
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.glassContent}>{children}</View>
            </View>

            {footer ? <View style={styles.footer}>{footer}</View> : null}

            <View style={{ height: theme.spacing['4xl'] }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.semantic.bg.page },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing['2xl'],
  },
  stepDot: {
    height: 8,
    borderRadius: 4,
  },
  title: { marginBottom: theme.spacing.xs },
  subtitle: { marginBottom: theme.spacing.xl },
  glassWrap: {
    borderRadius: theme.radii.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
  },
  glassContent: {
    padding: theme.spacing.lg,
  },
  footer: {
    marginTop: theme.spacing.xl,
  },
});
