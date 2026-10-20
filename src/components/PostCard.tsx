import React, { memo } from 'react';
import { View, StyleSheet, Pressable, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import {
  MoreHorizontal,
  MapPin,
  Clock,
  ExternalLink,
  Trash2,
} from 'lucide-react-native';

import { theme } from '@/theme';
import { Text } from './Text';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { ReactionButton } from './ReactionButton';
import { RunMapTrace } from './RunMapTrace';
import { RunPaceChart } from './RunPaceChart';
import { useToggleReaction } from '@/hooks/usePosts';
import { images } from '@/lib/images';
import type { Post } from '@/lib/posts';
import { formatDuration, formatPace, formatDistanceKm } from '@/hooks/useRun';
import { formatEventDate } from '@/lib/events';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - theme.spacing.lg * 2;

type Props = {
  post: Post;
  onPress?: () => void;
  onAuthorPress?: () => void;
  canDelete?: boolean;
  onDelete?: () => void;
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffS = Math.floor((now - then) / 1000);
  if (diffS < 60) return 'just now';
  const diffM = Math.floor(diffS / 60);
  if (diffM < 60) return `${diffM}m`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `${diffD}d`;
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export const PostCard = memo(function PostCard({
  post,
  onPress,
  onAuthorPress,
  canDelete,
  onDelete,
}: Props) {
  const toggleReaction = useToggleReaction();

  const route = post.type === 'run' && post.run?.route ? post.run.route : null;
  const hasRoute = route !== null && route.length > 2;
  
  const isAdmin = post.author.role === 'admin';
  const isAnnouncement = post.type === 'announcement';
  const isAd = post.type === 'ad';
  
  const imageHeight = CARD_WIDTH * 0.7;

  const actions = (
    <View style={styles.actions}>
      <ReactionButton
        count={post.reaction_count}
        active={post.reacted_by_me}
        onPress={() =>
          toggleReaction.mutate({
            postId: post.id,
            currentlyReacted: post.reacted_by_me,
          })
        }
        disabled={toggleReaction.isPending}
      />
      <View style={{ flex: 1 }} />
      {canDelete === true ? (
        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            onDelete?.();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Delete post"
          style={styles.menuButton}
        >
          <Trash2
            size={18}
            color={theme.textColors.clay[500]}
            strokeWidth={2}
          />
        </Pressable>
      ) : onPress ? (
        <Pressable
          onPress={onPress}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open post"
        >
          <MoreHorizontal
            size={20}
            color={theme.textColors.ink[300]}
            strokeWidth={2}
          />
        </Pressable>
      ) : null}
    </View>
  );

  // 1. AD LAYOUT
  if (isAd) {
    return (
      <View
        style={[styles.card, styles.cardAd]}
        onStartShouldSetResponder={() => Boolean(onPress)}
        onResponderRelease={() => {
          if (onPress) onPress();
        }}
      >
        <View style={styles.adHeader}>
          <Text variant="caption" color={theme.textColors.gold[600]} style={{ letterSpacing: 1.5 }}>
            SPONSORED
          </Text>
          <Text variant="caption" color={theme.semantic.text.tertiary}>
            by {post.author.full_name}
          </Text>
        </View>

        <View style={styles.adBody}>
          <Text variant="bodyM" style={{ fontWeight: '500' }}>
            {post.body}
          </Text>
        </View>

        <View style={[styles.imageWrap, { height: imageHeight }]}>
          <Image
            source={post.image_url ? { uri: post.image_url } : images.postFallback}
            style={styles.image}
            resizeMode="cover"
          />
          <Pressable 
            style={styles.adCta} 
            onPress={() => { /* Will link to external URL later */ }}
          >
            <ExternalLink size={16} color={theme.textColors.ink[900]} />
            <Text variant="bodyS" color={theme.textColors.ink[900]} style={{ fontWeight: '600' }}>
              Learn More
            </Text>
          </Pressable>
        </View>
        {actions}
      </View>
    );
  }

  // 2. ORGANIC POST LAYOUT
  return (
    <View
      style={styles.card}
      onStartShouldSetResponder={() => Boolean(onPress)}
      onResponderRelease={() => {
        if (onPress) onPress();
      }}
    >
      {/* Top Bar */}
      <View style={styles.head}>
        <Pressable
          onPress={onAuthorPress}
          disabled={!onAuthorPress}
          accessibilityRole={onAuthorPress ? 'button' : undefined}
          style={styles.authorPress}
        >
          <Avatar
            uri={post.author.avatar_url}
            name={post.author.full_name}
            size={32}
            role={post.author.role}
          />
          <View style={styles.authorMeta}>
            <Text variant="bodyS" style={styles.authorName}>
              {post.author.full_name}
            </Text>
            <Text variant="caption" color={theme.semantic.text.secondary}>
              {relativeTime(post.created_at)}
              {isAdmin ? ' · Admin' : ''}
            </Text>
          </View>
        </Pressable>

        {isAnnouncement ? (
          <Badge label="Announcement" variant="role" size="sm" />
        ) : null}
      </View>

      {/* Admin Caption (Above Image) */}
      {isAdmin && post.body ? (
        <Text variant="bodyM" style={styles.bodyAbove}>
          {post.body}
        </Text>
      ) : null}

      {/* Image Section */}
      <View style={[styles.imageWrap, { height: imageHeight }]}>
        <Image
          source={post.image_url ? { uri: post.image_url } : images.postFallback}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Run Stats Overlay */}
        {post.type === 'run' && post.run ? (
          <View style={styles.runStatsOverlay}>
            <Text variant="bodyL" color={theme.textColors.paper} tabular style={{ fontWeight: '700' }}>
              {formatDistanceKm(post.run.distance_m)} km
            </Text>
            <Text
              variant="caption"
              color="rgba(251,251,247,0.9)"
              tabular
            >
              {formatDuration(post.run.duration_s * 1000)}
              {post.run.avg_pace_s
                ? ` · ${formatPace(post.run.avg_pace_s)} /km`
                : ''}
            </Text>
          </View>
        ) : null}

        {/* Glass Overlay for Routes */}
        {hasRoute && route ? (
          <View style={styles.glassOverlay}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={styles.glassContent}>
              <View style={styles.traceContainer}>
                <RunMapTrace
                  route={route}
                  width={100}
                  height={60}
                  strokeColor={theme.fills.paper}
                  strokeWidth={2}
                />
              </View>
              <View style={styles.chartContainer}>
                <Text variant="caption" color="rgba(251,251,247,0.7)">
                  PACE
                </Text>
                <RunPaceChart route={route} width={100} height={30} />
              </View>
            </View>
          </View>
        ) : null}
      </View>

      {/* Member Caption (Below Image) */}
      {!isAdmin && post.body ? (
        <Text variant="bodyM" style={styles.bodyBelow}>
          {post.body}
        </Text>
      ) : null}

      {/* Event Meta */}
      {isAnnouncement && post.event ? (
        <View style={styles.eventMeta}>
          <View style={styles.metaRow}>
            <Clock size={12} color={theme.textColors.ink[500]} strokeWidth={2} />
            <Text variant="caption" color={theme.semantic.text.secondary} tabular>
              {formatEventDate(post.event.start_at)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MapPin size={12} color={theme.textColors.ink[500]} strokeWidth={2} />
            <Text variant="caption" color={theme.semantic.text.secondary}>
              {post.event.venue_name}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Footer */}
      {actions}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.fills.paper,
    borderRadius: theme.radii.card,
    overflow: 'hidden',
    ...theme.shadows.raised,
  },
  cardAd: {
    borderWidth: 1,
    borderColor: theme.fills.gold[400],
  },
  adHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.fills.gold[100],
  },
  adBody: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  adCta: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.fills.gold[400],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.button,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
  },
  authorPress: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.sm,
  },
  authorMeta: { flex: 1 },
  authorName: { fontWeight: '600' },
  bodyAbove: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  bodyBelow: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  imageWrap: {
    width: '100%',
    backgroundColor: theme.fills.matooke[200],
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  runStatsOverlay: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    backgroundColor: 'rgba(23,24,26,0.7)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radii.badge,
  },
  glassOverlay: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    left: theme.spacing.sm,
    right: theme.spacing.sm,
    borderRadius: theme.radii.badge,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  glassContent: {
    flexDirection: 'row',
    padding: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  traceContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  chartContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  eventMeta: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.fills.matooke[100],
  },
  menuButton: {
    padding: 4,
  },
});