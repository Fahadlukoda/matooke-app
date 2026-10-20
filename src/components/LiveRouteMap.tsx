import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { theme } from '@/theme';
import type { GPSPoint } from '@/lib/run-store';

type Props = {
  route: GPSPoint[];
  followUser?: boolean;
  style?: object;
  strokeColor?: string;
};

const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#F5F7EE' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#3E3F42' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#F5F7EE' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#D4DCC2' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#E8EDDC' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#D4DCC2' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#E8EDDC' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#D4DCC2' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#E8EDDC' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#D4DCC2' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3E3F42' }] },
];

export function LiveRouteMap({
  route,
  followUser = false,
  style,
  strokeColor = theme.fills.runTrack,
}: Props) {
  const coords = useMemo(
    () => route.map((p) => ({ latitude: p.lat, longitude: p.lng })),
    [route]
  );

  const current = coords.length > 0 ? coords[coords.length - 1] : null;
  const first = coords.length > 0 ? coords[0] : null;

  const initialRegion = current
    ? {
        latitude: current.latitude,
        longitude: current.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }
    : {
        latitude: 0.3136,
        longitude: 32.5811,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <View style={[styles.wrap, style]}>
      <MapView
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        customMapStyle={MAP_STYLE}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        {coords.length > 1 ? (
          <Polyline
            coordinates={coords}
            strokeColor={strokeColor}
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        ) : null}

        {first ? (
          <Marker coordinate={first} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.startDot} />
          </Marker>
        ) : null}

        {current ? (
          <Marker coordinate={current} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.activeDot} />
          </Marker>
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: theme.fills.matooke[100],
  },
  startDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.fills.paper,
    borderWidth: 3,
    borderColor: theme.fills.matooke[600],
  },
  activeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.fills.runActive,
    borderWidth: 3,
    borderColor: theme.fills.paper,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
});