import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, MapViewProps } from 'react-native-maps';

// Your Cesium token
const CESIUM_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZTlhYjgxOS0yNjA4LTQzY2ItYTNiZS03NTZhY2Q3NzI0MTAiLCJpZCI6MjkyODE5LCJpYXQiOjE3NDQ2NDgzODR9.KaJJ8putsj5CXxilima3qBW27ha0sd8R6M3XOrsXtLc';

interface NativeCesiumMapProps {
  coords: { latitude: number; longitude: number } | null;
  height?: number;
  interactive?: boolean;
}

// For mobile devices, we'll use react-native-maps as a fallback
// since Cesium doesn't work natively on mobile
const NativeCesiumMap = forwardRef(({ coords, height = 400, interactive = true }: NativeCesiumMapProps, ref) => {
  // Fix: Properly type the mapRef
  const mapRef = useRef<MapView>(null);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    postMessage: (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'flyTo' && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: data.latitude,
            longitude: data.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }, 1000);
        }
      } catch (e) {
        console.error('Error processing message in NativeCesiumMap:', e);
      }
    }
  }));

  if (!coords) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.text}>Waiting for coordinates...</Text>
      </View>
    );
  }

  return (
    <View style={{ height, borderRadius: 12, overflow: 'hidden' }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        pitchEnabled={interactive}
        rotateEnabled={interactive}
        mapType="satellite"
      >
        <Marker
          coordinate={{
            latitude: coords.latitude,
            longitude: coords.longitude,
          }}
        />
      </MapView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  text: {
    fontSize: 16,
    color: '#666',
  }
});

export default NativeCesiumMap;