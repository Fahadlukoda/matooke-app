import React, { useState } from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Play } from 'lucide-react-native';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Surface } from '@/components/Surface';
import { InsetSurface } from '@/components/InsetSurface';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Chip } from '@/components/Chip';
import { Skeleton } from '@/components/Skeleton';
import { Divider } from '@/components/Divider';
import { StatGrid } from '@/components/StatGrid';
import { ProgressScale } from '@/components/ProgressScale';

export function KitchenSink() {
  const [insetVariant, setInsetVariant] = useState<'gradient' | 'border'>('gradient');
  const [chipA, setChipA] = useState(true);
  const [chipB, setChipB] = useState(false);
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="displayL">Kitchen Sink</Text>
        <Text variant="bodyM" color={theme.semantic.text.secondary} style={styles.sub}>
          Every primitive, every state, at 375pt width.
        </Text>

        <Section title="Typography">
          <Text variant="displayXL">Display XL</Text>
          <Text variant="displayL">Display L</Text>
          <Text variant="displayM">Display M</Text>
          <Text variant="bodyL">Body L — 17/26 Inter 500</Text>
          <Text variant="bodyM">Body M — 15/22 Inter 400, default body text.</Text>
          <Text variant="bodyS">Body S — 13/20 Inter 500, secondary.</Text>
          <Text variant="caption">Caption — uppercase tracked</Text>
          <Text variant="mono" tabular>
            07:03 · 21.10 km · 4:58/km
          </Text>
        </Section>

        <Section title="Surface / elevation">
          <View style={styles.row}>
            <Surface elevation="flat" padding={16} style={styles.surfaceBox}>
              <Text variant="bodyS">flat</Text>
            </Surface>
            <Surface elevation="raised" padding={16} style={styles.surfaceBox}>
              <Text variant="bodyS">raised</Text>
            </Surface>
          </View>
          <View style={styles.row}>
            <Surface elevation="raisedLg" padding={16} style={styles.surfaceBox}>
              <Text variant="bodyS">raisedLg</Text>
            </Surface>
            <Surface elevation="raisedOnRaised" padding={16} style={styles.surfaceBox}>
              <Text variant="bodyS">onRaised</Text>
            </Surface>
          </View>
        </Section>

        <Section
          title={`InsetSurface — variant: ${insetVariant}`}
          action={
            <Button
              label={insetVariant === 'gradient' ? 'Switch to border' : 'Switch to gradient'}
              size="sm"
              variant="secondary"
              onPress={() =>
                setInsetVariant((v) => (v === 'gradient' ? 'border' : 'gradient'))
              }
            />
          }
        >
          <InsetSurface variant={insetVariant} padding={16}>
            <Text variant="bodyM">Recessed surface — this is what inputs sit on.</Text>
          </InsetSurface>
          <View style={{ height: theme.spacing.sm }} />
          <InsetSurface variant={insetVariant} radius={theme.radii.card} padding={20}>
            <Text variant="bodyM">Larger radius variant, same shadow logic.</Text>
          </InsetSurface>
        </Section>

        <Section title="Button">
          <View style={styles.row}>
            <Button label="Primary" onPress={() => {}} variant="primary" />
            <Button label="Secondary" onPress={() => {}} variant="secondary" />
          </View>
          <View style={styles.row}>
            <Button label="Ghost" onPress={() => {}} variant="ghost" />
            <Button label="Danger" onPress={() => {}} variant="danger" />
            <Button label="Gold" onPress={() => {}} variant="gold" />
          </View>
          <View style={styles.row}>
            <Button label="Small" onPress={() => {}} size="sm" />
            <Button label="Medium" onPress={() => {}} size="md" />
            <Button label="Large" onPress={() => {}} size="lg" />
          </View>
          <View style={styles.row}>
            <Button
              label="With icon"
              onPress={() => {}}
              leadingIcon={<Play size={16} color={theme.textColors.paper} strokeWidth={2.25} />}
            />
            <Button label="Loading" onPress={() => {}} loading />
            <Button label="Disabled" onPress={() => {}} disabled />
          </View>
          <Button label="Full width" onPress={() => {}} fullWidth />
        </Section>

        <Section title="TextField">
          <TextField
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            helper="We'll never share this."
          />
          <View style={{ height: theme.spacing.md }} />
          <TextField label="With error" placeholder="Required" error="This field is required." />
          <View style={{ height: theme.spacing.md }} />
          <TextField label="Multiline" placeholder="Medical notes" multiline />
        </Section>

        <Section title="Card">
          <Card>
            <Text variant="displayM">Marathons 2026</Text>
            <Text variant="bodyS" color={theme.semantic.text.secondary} style={{ marginTop: 4 }}>
              21 March · Kampala
            </Text>
          </Card>
          <View style={{ height: theme.spacing.sm }} />
          <Card onPress={() => {}}>
            <Text variant="bodyM">Tappable card — lifts on press.</Text>
          </Card>
        </Section>

        <Section title="Avatar">
          <View style={styles.row}>
            <Avatar size={32} name="Amina K" />
            <Avatar size={40} name="Brian O" />
            <Avatar size={56} name="Cathy N" role="captain" />
            <Avatar size={80} name="David M" role="admin" />
          </View>
          <View style={[styles.row, { marginTop: theme.spacing.sm }]}>
            <Avatar size={120} name="Elizabeth W" role="captain" />
          </View>
        </Section>

        <Section title="Badge">
          <View style={styles.row}>
            <Badge label="Neutral" />
            <Badge label="Success" variant="success" />
            <Badge label="Warning" variant="warning" />
            <Badge label="Danger" variant="danger" />
          </View>
          <View style={[styles.row, { marginTop: theme.spacing.sm }]}>
            <Badge label="Gold" variant="gold" />
            <Badge label="Captain" variant="role" />
            <Badge label="Small" size="sm" />
          </View>
        </Section>

        <Section title="Chip">
          <View style={styles.row}>
            <Chip label="5k" selected={chipA} onPress={() => setChipA((v) => !v)} />
            <Chip label="10k" selected={chipB} onPress={() => setChipB((v) => !v)} />
            <Chip label="21k" />
            <Chip label="42k" />
          </View>
        </Section>

        <Section title="Skeleton">
          <Skeleton variant="text" />
          <View style={{ height: theme.spacing.sm }} />
          <Skeleton variant="text" width="50%" />
          <View style={{ height: theme.spacing.md }} />
          <Skeleton variant="listRow" />
          <View style={{ height: theme.spacing.md }} />
          <Skeleton variant="card" />
        </Section>

        <Section title="Divider">
          <Text variant="bodyS">Above divider.</Text>
          <Divider style={{ marginVertical: theme.spacing.sm }} />
          <Text variant="bodyS">Below divider.</Text>
          <Divider inset={theme.spacing.md} style={{ marginVertical: theme.spacing.sm }} />
          <Text variant="bodyS">Inset divider above.</Text>
        </Section>

        <Section title="StatGrid">
          <StatGrid
            cells={[
              { label: 'Distance', value: '21.10 km' },
              { label: 'Time', value: '1:42:18' },
              { label: 'Avg pace', value: '4:51/km' },
              { label: 'Steps', value: '22,109' },
            ]}
            columns={2}
          />
        </Section>

        <Section title="ProgressScale">
          <ProgressScale
            segments={[
              { label: 'Very low', weight: 1 },
              { label: 'Low', weight: 1 },
              { label: 'Normal', weight: 1 },
              { label: 'Increased', weight: 1 },
              { label: 'High', weight: 1 },
            ]}
            value={0.62}
            valueLabel="38 of 120 km · 32%"
          />
        </Section>

        <View style={{ height: theme.spacing['4xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <Text variant="caption" color={theme.semantic.text.secondary}>
          {title}
        </Text>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.semantic.bg.page,
  },
  scroll: {
    padding: theme.spacing.lg,
    maxWidth: 375 + theme.spacing.lg * 2,
    width: '100%',
    alignSelf: 'center',
  },
  sub: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing['2xl'],
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  surfaceBox: {
    minWidth: 120,
  },
});