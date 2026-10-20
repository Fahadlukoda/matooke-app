import React from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { theme } from '@/theme';
import { Text } from '@/components/Text';
import { PostCard } from '@/components/PostCard';
import { ScreenHeader } from '@/components/ScreenHeader';
import { usePost } from '@/hooks/usePosts';
import type { HomeStackParamList } from '@/navigation/HomeStack';

type Props = NativeStackScreenProps<HomeStackParamList, 'PostDetail'>;

export function PostDetail({ route, navigation }: Props) {
  const { postId } = route.params;
  const postQuery = usePost(postId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Post" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {postQuery.isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={theme.fills.matooke[500]} />
          </View>
        ) : postQuery.isError || !postQuery.data ? (
          <View style={styles.center}>
            <Text variant="bodyM" color={theme.semantic.text.danger}>
              Couldn't load this post.
            </Text>
          </View>
        ) : (
          <PostCard post={postQuery.data} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.semantic.bg.page },
  scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing['2xl'] },
  center: { paddingVertical: theme.spacing['4xl'], alignItems: 'center' },
});