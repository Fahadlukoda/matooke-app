import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Calendar, Footprints, Trophy, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '@/theme';
import { Text } from './Text';

const TAB_LABELS: Record<string, string> = {
  Home: 'Home',
  Events: 'Events',
  Run: 'Run',
  Results: 'Results',
  Profile: 'Profile',
};

const TAB_ICONS = {
  Home: Home,
  Events: Calendar,
  Run: Footprints,
  Results: Trophy,
  Profile: User,
};

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 16);

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]} pointerEvents="box-none">
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const options = descriptor?.options ?? {};
          const isFocused = state.index === index;
          const isCenter = route.name === 'Run';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const Icon = TAB_ICONS[route.name as keyof typeof TAB_ICONS];
          const label = TAB_LABELS[route.name] ?? route.name;
          if (!Icon) return null;

          if (isCenter) {
            return (
              <View key={route.key} style={styles.centerWrapper} pointerEvents="box-none">
                <Pressable
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  style={({ pressed }) => [
                    styles.centerButton,
                    pressed && { transform: [{ scale: 0.96 }] },
                  ]}
                >
                  <View style={styles.centerButtonInner}>
                    <Icon
                      size={28}
                      color={theme.textColors.paper}
                      strokeWidth={2.5}
                      fill={theme.textColors.paper}
                    />
                  </View>
                </Pressable>
                <Text
                  variant="caption"
                  color={theme.semantic.text.primary}
                  style={styles.centerLabel}
                >
                  RUN
                </Text>
              </View>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              style={styles.tabButton}
            >
              <View
                style={[
                  styles.tabInner,
                  isFocused && styles.tabInnerActive,
                ]}
              >
                <Icon
                  size={20}
                  color={isFocused ? theme.fills.matooke[700] : theme.textColors.ink[500]}
                  strokeWidth={isFocused ? 2.5 : 2}
                />
                <Text
                  variant="caption"
                  color={isFocused ? theme.fills.matooke[700] : theme.textColors.ink[500]}
                  style={styles.tabLabel}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    pointerEvents: 'box-none',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.fills.paper,
    width: '90%',
    maxWidth: 400,
    height: 68,
    borderRadius: 34,
    paddingHorizontal: theme.spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#17181A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0px 8px 24px rgba(23, 24, 26, 0.12)',
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tabInnerActive: {
    backgroundColor: theme.fills.matooke[100],
  },
  tabLabel: {
    marginTop: 2,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  centerWrapper: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.fills.matooke[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: theme.semantic.bg.page,
    ...Platform.select({
      ios: {
        shadowColor: theme.fills.matooke[600],
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 6px 16px rgba(107, 142, 35, 0.35)',
      },
    }),
  },
  centerButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    marginTop: 4,
    fontSize: 9,
    letterSpacing: 1,
  },
});