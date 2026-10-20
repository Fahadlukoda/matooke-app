import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Switch, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Divider } from '@/components/Divider';
import { ScreenHeader } from '@/components/ScreenHeader';
import { signOut } from '@/hooks/useProfile';
import type { ProfileStackParamList } from '@/navigation/ProfileStack';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export function Settings({ navigation }: Props) {
  const [notifyEvents, setNotifyEvents] = useState(true);
  const [notifyResults, setNotifyResults] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  async function onSignOut() {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="caption" color={theme.semantic.text.secondary}>
          Notifications
        </Text>
        <View style={styles.gapSm} />
        <Card padding={0}>
          <RowSwitch
            label="Event reminders"
            value={notifyEvents}
            onChange={setNotifyEvents}
          />
          <Divider inset={theme.spacing.lg} />
          <RowSwitch
            label="Results posted"
            value={notifyResults}
            onChange={setNotifyResults}
          />
        </Card>

        <View style={styles.gapLg} />
        <Text variant="caption" color={theme.semantic.text.secondary}>
          About
        </Text>
        <View style={styles.gapSm} />
        <Card padding={0}>
          <RowLink label="Privacy policy" onPress={() => {}} />
          <Divider inset={theme.spacing.lg} />
          <RowLink label="Terms of use" onPress={() => {}} />
          <Divider inset={theme.spacing.lg} />
          <RowLink label="Contact support" onPress={() => {}} />
        </Card>

        <View style={styles.gapLg} />
        <Button
          label="Sign out"
          onPress={onSignOut}
          variant="secondary"
          size="lg"
          fullWidth
          loading={signingOut}
          disabled={signingOut}
        />

        <View style={styles.gapLg} />
        <Button
          label="Delete account"
          onPress={() => {}}
          variant="ghost"
          size="md"
          fullWidth
          disabled
        />
        <View style={styles.gapSm} />
        <Text variant="bodyS" color={theme.semantic.text.secondary} align="center">
          Account deletion arrives in a later phase.
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
}

function RowSwitch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Text variant="bodyM">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: theme.fills.matooke[200], true: theme.fills.matooke[500] }}
        thumbColor={theme.fills.paper}
      />
    </View>
  );
}

function RowLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.row}>
      <Text variant="bodyM">{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing['2xl'] },
  gapSm: { height: theme.spacing.sm },
  gapLg: { height: theme.spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 52,
  },
});