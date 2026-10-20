import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MapPin } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { RunReadyHeader } from '@/components/RunReadyHeader';
import { RunHistoryRow } from '@/components/RunHistoryRow';
import { RepeatRunSheet } from '@/components/RepeatRunSheet';
import { TodayEventCard } from '@/components/TodayEventCard';
import {
  checkRunPermissions,
  requestRunPermissions,
  type RunPermissions,
} from '@/lib/permissions';
import { getEventRunState } from '@/lib/eventRunState';
import { useEvents, useRegistrationForEvent } from '@/hooks/useEvents';
import { useMyRuns } from '@/hooks/useRuns';
import { formatDistanceKm, formatDuration, formatPace } from '@/hooks/useRun';
import type { Run } from '@/lib/runs';
import type { RunStackParamList } from '@/navigation/RunStack';
import type { EventsStackParamList } from '@/navigation/EventsStack';

type Props = NativeStackScreenProps<RunStackParamList, 'RunReady'>;

type LockState = 'searching' | 'weak' | 'locked';

export function RunReady({ navigation }: Props) {
  const [permissions, setPermissions] = useState<RunPermissions | null>(null);
  const [lock, setLock] = useState<LockState>('searching');
  const [repeatRun, setRepeatRun] = useState<Run | null>(null);

  const eventsQuery = useEvents();
  const runsQuery = useMyRuns();
  const rootNav = useNavigation<any>();

  const todayEvent = useMemo(() => {
    const today = new Date();
    return (eventsQuery.data ?? [])
      .filter((event) => {
        const startAt = new Date(event.start_at);
        return (
          startAt.getFullYear() === today.getFullYear() &&
          startAt.getMonth() === today.getMonth() &&
          startAt.getDate() === today.getDate()
        );
      })
      .sort(
        (a, b) =>
          new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
      )[0] ?? null;
  }, [eventsQuery.data]);
  const registrationQuery = useRegistrationForEvent(todayEvent?.id);
  const eventState = todayEvent
    ? getEventRunState(todayEvent, registrationQuery.data ?? null)
    : 'open';

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const result = await checkRunPermissions();
      if (cancelled) return;
      setPermissions(result);

      if (!result.canTrack) {
        setLock('searching');
        return;
      }

      setTimeout(() => !cancelled && setLock('weak'), 800);
      setTimeout(() => !cancelled && setLock('locked'), 2000);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onStartPersonalRun() {
    if (!permissions?.canTrack) {
      const result = await requestRunPermissions();
      setPermissions(result);
      if (!result.canTrack) return;
    }
    navigation.navigate('RunLive', { eventId: null });
  }

  function openEvent(eventId: string) {
    rootNav.navigate('Events', {
      screen: 'EventDetail',
      params: { eventId },
    } satisfies {
      screen: keyof EventsStackParamList;
      params: { eventId: string };
    });
  }

  function formatRunDescription(run: Run): string {
    const pace =
      run.avg_pace_s != null && run.avg_pace_s > 0
        ? `, ${formatPace(run.avg_pace_s)} per kilometer`
        : '';
    return `${new Date(run.started_at).toLocaleDateString('en-GB')}, ${formatDistanceKm(run.distance_m)} kilometers, ${formatDuration(run.duration_s * 1000)}${pace}`;
  }

  return (
    <View style={styles.safe}>
      <RunReadyHeader />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.gpsCard}>
          <Card>
            <View style={styles.lockRow}>
              <MapPin
                size={20}
                color={
                  lock === 'locked'
                    ? theme.fills.matooke[600]
                    : lock === 'weak'
                    ? theme.fills.gold[600]
                    : theme.textColors.ink[500]
                }
                strokeWidth={2}
              />
              <Text variant="bodyM" style={styles.lockText}>
                {lock === 'locked'
                  ? 'GPS locked'
                  : lock === 'weak'
                  ? 'Searching for signal…'
                  : 'Getting GPS…'}
              </Text>
              <Badge
                label={lock === 'locked' ? 'Good' : lock === 'weak' ? 'Weak' : 'Waiting'}
                variant={lock === 'locked' ? 'success' : 'warning'}
                size="sm"
              />
            </View>

            {permissions && !permissions.canTrack ? (
              <Text
                variant="bodyS"
                color={theme.semantic.text.danger}
                style={styles.permNote}
              >
                Location permission is required to track your run.
              </Text>
            ) : null}

            {permissions && !permissions.canCountSteps ? (
              <Text
                variant="bodyS"
                color={theme.semantic.text.secondary}
                style={styles.permNote}
              >
                Steps will not be counted on this device.
              </Text>
            ) : null}
          </Card>
        </View>

        <View style={styles.recentSection}>
          <Text variant="caption" color={theme.semantic.text.secondary}>
            Recent runs
          </Text>
          {runsQuery.isLoading ? (
            <ActivityIndicator
              color={theme.fills.matooke[500]}
              style={styles.loading}
            />
          ) : runsQuery.isError ? (
            <Text
              variant="bodyS"
              color={theme.semantic.text.secondary}
              style={styles.message}
            >
              Could not load recent runs.
            </Text>
          ) : (runsQuery.data ?? []).length === 0 ? (
            <Text
              variant="bodyS"
              color={theme.semantic.text.secondary}
              style={styles.message}
            >
              No runs yet. Your first one will show up here.
            </Text>
          ) : (
            <View style={styles.runList}>
              {(runsQuery.data ?? []).slice(0, 4).map((run) => (
                <RunHistoryRow
                  key={run.id}
                  run={run}
                  accessibilityLabel={`Repeat run from ${formatRunDescription(run)}`}
                  onPress={() => setRepeatRun(run)}
                />
              ))}
            </View>
          )}
        </View>

        {todayEvent ? (
          <View style={styles.eventSection}>
            <Text variant="caption" color={theme.semantic.text.secondary}>
              Today's event
            </Text>
            <TodayEventCard
              event={todayEvent}
              state={eventState}
              onPressStart={onStartPersonalRun}
              onPressRegister={() => openEvent(todayEvent.id)}
              style={styles.todayEventCard}
            />
          </View>
        ) : null}

        <Button
          label="Start run"
          onPress={onStartPersonalRun}
          variant="hero"
          size="lg"
          fullWidth
          disabled={lock === 'searching' && permissions?.canTrack === true}
          style={styles.startButton}
        />
      </ScrollView>

      <RepeatRunSheet
        run={repeatRun}
        visible={repeatRun !== null}
        onCancel={() => setRepeatRun(null)}
        onStart={() => {
          setRepeatRun(null);
          void onStartPersonalRun();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  scroll: { flex: 1 },
  contentContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: 0,
    paddingBottom: 120,
  },
  gpsCard: {
    marginTop: theme.spacing.lg,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  lockText: { flex: 1 },
  permNote: { marginTop: theme.spacing.md },
  recentSection: { marginTop: theme.spacing.lg },
  runList: { marginTop: theme.spacing.sm, gap: theme.spacing.sm },
  loading: { marginTop: theme.spacing.md },
  message: { marginTop: theme.spacing.sm },
  eventSection: {
    marginTop: theme.spacing.lg,
  },
  todayEventCard: {
    marginTop: theme.spacing.sm,
  },
  startButton: {
    marginTop: theme.spacing.lg,
  },
});
