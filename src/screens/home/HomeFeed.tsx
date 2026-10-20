import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  RefreshControl,
  Pressable,
  Image,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { Megaphone } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Post } from '@/lib/posts';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { PostCard } from '@/components/PostCard';
import { UpNextCarousel } from '@/components/UpNextCarousel';
import { Skeleton } from '@/components/Skeleton';
import { HeroOverlay } from '@/components/HeroOverlay';
import { TodayCard } from '@/components/TodayCard';
import { useDeletePost, useFeed } from '@/hooks/usePosts';
import { useEvents } from '@/hooks/useEvents';
import { useProfile } from '@/hooks/useProfile';
import { useMyRuns } from '@/hooks/useRuns';
import { images } from '@/lib/images';
import { getGreeting } from '@/lib/helpers';
import { useTopInset } from '@/lib/insets';
import type { HomeStackParamList } from '@/navigation/HomeStack';
import type { EventsStackParamList } from '@/navigation/EventsStack';

type Props = NativeStackScreenProps<HomeStackParamList, 'HomeFeed'>;

const HEADER_HEIGHT = 235;
const HEADER_COLLAPSE_DISTANCE = 100;

function confirmDeletePost(): Promise<boolean> {
  const title = 'Delete post?';
  const message = 'This cannot be undone.';
  if (Platform.OS === 'web') {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(false) },
      { text: 'Delete', style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}

export function HomeFeed({ navigation }: Props) {
  const feedQuery = useFeed();
  const eventsQuery = useEvents();
  const runsQuery = useMyRuns();
  const profileQuery = useProfile();
  const { mutateAsync: deletePost } = useDeletePost();
  const rootNav = useNavigation<any>();
  const topInset = useTopInset();
  const scrollOffset = useSharedValue(0);
  const topBarHeight = useSharedValue(36);
  const greetingHeight = useSharedValue(58);
  const greetingSwipe = useSharedValue(0);
  const hasPlayedSwipe = useRef(false);

  useEffect(() => {
    if (hasPlayedSwipe.current) return;
    hasPlayedSwipe.current = true;
    greetingSwipe.value = withTiming(1, {
      duration: 420,
      easing: Easing.inOut(Easing.cubic),
    });
  }, []);

  const posts = feedQuery.data ?? [];
  const myProfileId = profileQuery.data?.id;
  const firstName = profileQuery.data?.full_name?.split(' ')[0] ?? 'runner';
  const greeting = getGreeting();
  const todayRun = useMemo(() => {
    if (!runsQuery.data) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return runsQuery.data.find(
      (r) => new Date(r.started_at).getTime() >= today.getTime()
    ) ?? null;
  }, [runsQuery.data]);
  const dailySteps = todayRun?.steps ?? 0;
  const dailyCalories = todayRun?.calories ?? 0;
  const greetingAnimatedStyle = useAnimatedStyle(() => ({
    opacity: greetingSwipe.value,
    transform: [{ translateX: interpolate(greetingSwipe.value, [0, 1], [-24, 0]) }],
  }));
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
    },
  });
  const headerStyle = useAnimatedStyle(() => {
    const minHeight = Math.min(
      HEADER_HEIGHT,
      topInset +
        theme.spacing.md +
        topBarHeight.value +
        theme.spacing.sm +
        greetingHeight.value +
        theme.spacing.xl
    );

    return {
      height: interpolate(
        scrollOffset.value,
        [0, HEADER_COLLAPSE_DISTANCE],
        [HEADER_HEIGHT, minHeight],
        Extrapolation.CLAMP
      ),
    };
  });

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return (eventsQuery.data ?? []).filter(
      (e) => new Date(e.start_at).getTime() > now
    );
  }, [eventsQuery.data]);

  function openEvent(eventId: string) {
    rootNav.navigate('Events', {
      screen: 'EventDetail',
      params: { eventId },
    } satisfies { screen: keyof EventsStackParamList; params: { eventId: string } });
  }

  const handleDelete = useCallback(
    async (post: Post) => {
      if (!(await confirmDeletePost())) return;

      try {
        await deletePost(post.id);
      } catch {
        const message = 'Could not delete the post. Please try again.';
        if (Platform.OS === 'web') {
          window.alert(message);
        } else {
          Alert.alert('Delete failed', message);
        }
      }
    },
    [deletePost]
  );

  const renderPost = useCallback(
    ({ item }: { item: Post }) => {
      const canDelete = item.author_id === myProfileId;

      return (
        <PostCard
          post={item}
          onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
          canDelete={canDelete}
          onDelete={canDelete ? () => handleDelete(item) : undefined}
        />
      );
    },
    [navigation, myProfileId, handleDelete]
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  return (
    <View style={styles.root}>
      <Animated.View
        style={[
          styles.headerContainer,
          { paddingTop: topInset + theme.spacing.md },
          headerStyle,
        ]}
      >
        <Image
          source={images.homeHero}
          style={styles.bgImage}
          resizeMode="cover"
        />

        <HeroOverlay />

        <View style={styles.shape1} />
        <View style={styles.shape2} />

        <View style={styles.headerContent}>
          <View
            style={styles.topBar}
            onLayout={(event) => {
              topBarHeight.value = event.nativeEvent.layout.height;
            }}
          >
            <View style={styles.logoWrap}>
              <Image
                source={images.clearLogo}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text variant="bodyL" color={theme.textColors.paper} style={styles.brandText}>
              Team Matooke
            </Text>
          </View>

          <Animated.View
            style={[styles.greetingBlock, greetingAnimatedStyle]}
            onLayout={(event) => {
              greetingHeight.value = event.nativeEvent.layout.height;
            }}
          >
            <Text variant="displayL" color={theme.textColors.paper}>
              {greeting},
            </Text>
            <Text variant="displayL" color={theme.textColors.paper}>
              {firstName}.
            </Text>
          </Animated.View>
        </View>

      </Animated.View>

      {/* Feed List */}
      <Animated.FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={
              feedQuery.isRefetching ||
              eventsQuery.isRefetching ||
              runsQuery.isRefetching
            }
            onRefresh={() => {
              feedQuery.refetch();
              eventsQuery.refetch();
              runsQuery.refetch();
            }}
            tintColor={theme.fills.matooke[500]}
          />
        }
        ListHeaderComponent={
          <View>
            <View style={{ marginBottom: theme.spacing.xl }}>
              <TodayCard
                todayRun={todayRun}
                dailySteps={dailySteps}
                dailyCalories={dailyCalories}
              />
            </View>

            {upcomingEvents.length > 0 ? (
              <View style={styles.sectionWrap}>
                <Text
                  variant="caption"
                  color={theme.semantic.text.secondary}
                  style={[
                    styles.sectionCaption,
                    { paddingHorizontal: theme.spacing.lg },
                  ]}
                >
                  Up next
                </Text>
                <UpNextCarousel
                  events={upcomingEvents}
                  onPressEvent={(event) => openEvent(event.id)}
                />
              </View>
            ) : null}

            {posts.length > 0 ? (
              <View style={styles.feedHeading}>
                <Text variant="caption" color={theme.semantic.text.secondary}>
                  Club activity
                </Text>
              </View>
            ) : null}
          </View>
        }
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={
          feedQuery.isLoading ? (
            <View style={styles.skeletons}>
              <Skeleton variant="card" />
              <View style={styles.separator} />
              <Skeleton variant="card" />
            </View>
          ) : feedQuery.isError ? (
            <Pressable onPress={() => feedQuery.refetch()} style={styles.errorBox}>
              <Text variant="bodyS" color={theme.semantic.text.danger} align="center">
                Couldn't load the feed. Tap to retry.
              </Text>
            </Pressable>
          ) : (
            <View style={styles.empty}>
              <Megaphone size={32} color={theme.textColors.ink[300]} strokeWidth={1.75} />
              <Text variant="bodyL" align="center" style={styles.emptyHeading}>
                Nothing here yet
              </Text>
              <Text
                variant="bodyM"
                color={theme.semantic.text.secondary}
                align="center"
                style={styles.emptySub}
              >
                Share a run from the Run tab, or wait for an announcement from a
                club captain.
              </Text>
            </View>
          )
        }
        renderItem={renderPost}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.semantic.bg.page },

  headerContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    zIndex: 10,
  },
  bgImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  shape1: {
    position: 'absolute',
    top: 40,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.fills.matooke[500],
    opacity: 0.45,
  },
  shape2: {
    position: 'absolute',
    top: 100,
    right: 40,
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: theme.fills.gold[400],
    opacity: 0.5,
    transform: [{ rotate: '45deg' }],
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'space-between',
    zIndex: 2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  logoWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandText: {
    fontWeight: '600',
  },
  greetingBlock: {
    marginBottom: theme.spacing.xl,
  },

  // List Styles
  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 120,
    flexGrow: 1,
  },
  sectionWrap: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionCaption: {
    marginBottom: theme.spacing.sm,
  },
  feedHeading: {
    marginBottom: theme.spacing.md,
  },
  separator: { height: theme.spacing.md },
  skeletons: { gap: theme.spacing.md },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing['4xl'],
    gap: theme.spacing.md,
  },
  emptyHeading: { marginTop: theme.spacing.xs },
  emptySub: { maxWidth: 280 },
  errorBox: {
    paddingVertical: theme.spacing['4xl'],
    alignItems: 'center',
  },
});