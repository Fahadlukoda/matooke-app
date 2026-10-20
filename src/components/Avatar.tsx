import React from 'react';
import { View, Image, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '@/theme';
import { Text } from './Text';

type Size = 32 | 40 | 56 | 80 | 120;
type Role = 'member' | 'captain' | 'admin';

type Props = {
  uri?: string | null;
  name?: string | null;
  size?: Size;
  role?: Role;
  style?: StyleProp<ViewStyle>;
};

function initials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function fontSizeFor(size: Size): number {
  if (size >= 120) return 40;
  if (size >= 80) return 28;
  if (size >= 56) return 20;
  if (size >= 40) return 15;
  return 12;
}

function ringColor(role?: Role): string | undefined {
  if (role === 'admin') return theme.fills.matooke[700];
  if (role === 'captain') return theme.fills.gold[400];
  return undefined;
}

export function Avatar({ uri, name, size = 40, role, style }: Props) {
  const ring = ringColor(role);
  const radius = size / 2;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: ring ? 2 : 0,
          borderColor: ring ?? 'transparent',
        },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: '100%', height: '100%', borderRadius: radius }}
        />
      ) : (
        <View
          style={[
            styles.fallback,
            { borderRadius: radius, backgroundColor: theme.fills.matooke[200] },
          ]}
        >
          <Text
            variant="bodyS"
            color={theme.textColors.matooke[700]}
            style={{ fontSize: fontSizeFor(size) }}
          >
            {initials(name)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.fills.matooke[100],
  },
  fallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});