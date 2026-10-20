import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronRight,
  Medal,
  Receipt,
  Settings,
  Shield,
  Ticket,
  Trophy,
} from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Divider } from '@/components/Divider';
import { StatGrid } from '@/components/StatGrid';
import { PerformanceChart } from '@/components/PerformanceChart';
import { useProfile } from '@/hooks/useProfile';
import { useMyPersonalBests } from '@/hooks/useResults';
import { useWeeklyPerformance } from '@/hooks/useWeeklyPerformance';
import { formatResultTime } from '@/lib/results';
import type { ProfileStackParamList } from '@/navigation/ProfileStack';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

const DISTANCE_ORDER = [5, 10, 21, 42];
const BAND_HEIGHT = 148;
const AVATAR_SIZE = 120;
const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - theme.spacing.lg * 4;

export function Profile({ navigation }: Props) {
  const profileQuery = useProfile();
  const bestsQuery = useMyPersonalBests();
  const weeklyPerfQuery = useWeeklyPerformance();
  const rootNav = useNavigation<any>();

  const profile = profileQuery.data;
  const bests = bestsQuery.data ?? [];

  if (profileQuery.isLoading || !profile) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={theme.fills.matooke[500]} />
        </View>
      </SafeAreaView>
    );
  }

  const pbByDistance = new Map(bests.map((b) => [Number(b.distance_km), b]));

  const pbCells = DISTANCE_ORDER.map((d) => {
    const pb = pbByDistance.get(d);
    return {
      label: `${d}k PB`,
      value: pb ? formatResultTime(pb.best_duration_s) : '—:—',
    };
  });

  function goToResults() {
    rootNav.navigate('Results');
  }

  const showAdminRow = profile.role === 'admin' || profile.role === 'captain';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.band} />

        <View style={styles.identityWrap}>
          <View style={styles.avatarWrap}>
            <Avatar
              uri={profile.avatar_url}
              name={profile.full_name}
              size={AVATAR_SIZE}
              role={profile.role}
            />
          </View>

          <Text variant="displayL" align="center" style={styles.name}>
            {profile.full_name}
          </Text>

          <View style={styles.badgeRow}>
            {profile.role !== 'member' ? (
              <Badge
                label={profile.role === 'admin' ? 'Admin' : 'Captain'}
                variant="role"
              />
            ) : null}
            {profile.city ? <Badge label={profile.city} variant="neutral" /> : null}
            {profile.level ? (
              <Badge
                label={
                  profile.level.charAt(0).toUpperCase() + profile.level.slice(1)
                }
                variant="gold"
              />
            ) : null}
          </View>

          {bests.length > 0 ? (
            <Text
              variant="bodyS"
              color={theme.semantic.text.secondary}
              tabular
              style={styles.identityStats}
            >
              {bests.length} {bests.length === 1 ? 'PB' : 'PBs'}
              {bests.some((b) => b.source === 'race') ? ' · racing' : ''}
            </Text>
          ) : null}

          <View style={styles.editRow}>
            <Button
              label="Edit profile"
              onPress={() => navigation.navigate('EditProfile')}
              variant="secondary"
              size="md"
            />
            <View style={styles.editGap} />
            <Button
              label="Private details"
              onPress={() => navigation.navigate('PrivateDetails')}
              variant="ghost"
              size="md"
            />
          </View>
        </View>

        <View style={styles.identityCardGap} />

        <SectionLabel>Progress</SectionLabel>
        <Card padding={theme.spacing.lg} style={styles.personalBestsCard}>
          <View style={styles.cardHead}>
            <Text variant="caption" color={theme.semantic.text.secondary}>
              Personal bests
            </Text>
            <Pressable onPress={goToResults} hitSlop={8} accessibilityRole="button">
              <Text variant="bodyS" color={theme.semantic.text.brand}>
                See all
              </Text>
            </Pressable>
          </View>
          <View style={styles.chartWrap}>
            {weeklyPerfQuery.isError ? (
              <Text
                variant="bodyS"
                color={theme.semantic.text.danger}
                align="center"
                style={styles.chartError}
              >
                Couldn't load your performance trend.
              </Text>
            ) : (
              <PerformanceChart
                data={weeklyPerfQuery.data ?? []}
                width={chartWidth}
                height={80}
              />
            )}
          </View>
          <Divider style={styles.chartDivider} />
          {bests.length === 0 ? (
            <Text
              variant="bodyS"
              color={theme.semantic.text.secondary}
              align="center"
              style={styles.emptyBests}
            >
              Finish a 5k, 10k, 21k, or 42k to see your bests here.
            </Text>
          ) : (
            <StatGrid columns={2} cells={pbCells} />
          )}
        </Card>

        <SectionLabel>My club</SectionLabel>
        <Card padding={0}>
          <Row
            label="My results"
            onPress={goToResults}
            icon={<Trophy size={18} color={theme.textColors.ink[500]} />}
          />
          <Divider inset={theme.spacing.lg} />
          <Row
            label="Leaderboard"
            onPress={() =>
              rootNav.navigate('Results', { screen: 'Leaderboard' })
            }
            icon={<Medal size={18} color={theme.textColors.ink[500]} />}
          />
          <Divider inset={theme.spacing.lg} />
          <Row
            label="My registrations"
            onPress={() =>
              rootNav.navigate('Events', { screen: 'MyRegistrations' })
            }
            icon={<Ticket size={18} color={theme.textColors.ink[500]} />}
          />
          <Divider inset={theme.spacing.lg} />
          <Row
            label="My receipts"
            onPress={() => navigation.navigate('MyReceipts')}
            icon={<Receipt size={18} color={theme.textColors.ink[500]} />}
          />
        </Card>

        <SectionLabel>Account</SectionLabel>
        <Card padding={0}>
          <Row
            label="Settings"
            onPress={() => navigation.navigate('Settings')}
            icon={<Settings size={18} color={theme.textColors.ink[500]} />}
          />
        </Card>

        {showAdminRow ? (
          <>
            <SectionLabel>Admin</SectionLabel>
            <Card padding={0}>
              <Row
                label={
                  profile.role === 'admin' ? 'Admin tools' : 'Captain tools'
                }
                onPress={() => navigation.navigate('AdminHome')}
                icon={<Shield size={18} color={theme.textColors.ink[500]} />}
              />
            </Card>
          </>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      variant="caption"
      color={theme.semantic.text.secondary}
      style={styles.sectionLabel}
    >
      {children}
    </Text>
  );
}

function Row({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={styles.row}>
      <View style={styles.rowLeft}>
        {icon ? <View style={styles.rowIcon}>{icon}</View> : null}
        <Text variant="bodyM">{label}</Text>
      </View>
      <ChevronRight size={20} color={theme.textColors.ink[300]} strokeWidth={2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 120,
  },
  band: {
    height: BAND_HEIGHT,
    marginHorizontal: -theme.spacing.lg,
    backgroundColor: theme.fills.matooke[500],
    paddingHorizontal: theme.spacing.lg,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: 'hidden',
  },
  identityWrap: {
    marginTop: -AVATAR_SIZE / 2,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
  },
  avatarWrap: {
    borderWidth: 4,
    borderColor: theme.semantic.bg.page,
    borderRadius: (AVATAR_SIZE + 8) / 2,
  },
  name: { marginTop: theme.spacing.md },
  identityStats: { marginTop: theme.spacing.sm, textAlign: 'center' },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    justifyContent: 'center',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  editGap: { width: theme.spacing.sm },
  identityCardGap: { height: theme.spacing.xl },
  sectionLabel: {
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  emptyBests: { paddingVertical: theme.spacing.lg },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  personalBestsCard: {
    backgroundColor: theme.fills.matooke[100],
  },
  chartWrap: {
    marginTop: theme.spacing.sm,
  },
  chartError: {
    height: 80,
    textAlignVertical: 'center',
  },
  chartDivider: {
    marginVertical: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 52,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  rowIcon: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});