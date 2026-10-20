import React from 'react';
import { Image, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { images } from '@/lib/images';

type Size = 'sm' | 'md' | 'lg' | 'xl' | 'hero';
type Props = { size?: Size; style?: StyleProp<ViewStyle>; };

const SIZES: Record<Size, number> = { sm: 24, md: 40, lg: 64, xl: 96, hero: 140 };

export function Logo({ size = 'md', style }: Props) {
  const px = SIZES[size];
  return (
    <View style={[styles.wrap, { width: px, height: px }, style]}>
      <Image
        source={images.logo}
        style={{ width: px, height: px }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});