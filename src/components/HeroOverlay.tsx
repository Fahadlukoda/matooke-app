import React from 'react';
import { StyleSheet, View } from 'react-native';

const OPACITY = 0.35;

/** Flat black overlay for hero images. Intentionally not a gradient. */
export function HeroOverlay() {
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: `rgba(0,0,0,${OPACITY})` },
      ]}
    />
  );
}
