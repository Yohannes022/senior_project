import React from 'react';
import { View } from 'react-native';
import MapScreen from '@/components/MapScreen';

export default function MapScreenRoute() {
  return (
    <View style={{ flex: 1 }}>
      <MapScreen />
    </View>
  );
}
