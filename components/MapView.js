import React from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MapView({ style, initialRegion, onRegionChange, markers = [] }) {
  // Convert markers to a format that can be used in the HTML
  const markersScript = markers
    .map(marker => `L.marker([${marker.latitude}, ${marker.longitude}])${marker.title ? `.bindPopup('${marker.title}')` : ''}.addTo(map);`)
    .join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body { margin: 0; padding: 0; }
        #map { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        // Initialize the map
        const map = L.map('map').setView([${initialRegion?.latitude || 9.0054}, ${initialRegion?.longitude || 38.7636}], ${initialRegion?.zoom || 13});
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add markers
        ${markersScript}

        // Handle map move events
        function onMapMove() {
          const center = map.getCenter();
          const zoom = map.getZoom();
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'onRegionChange',
            region: {
              latitude: center.lat,
              longitude: center.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
              zoom: zoom
            }
          }));
        }

        map.on('moveend', onMapMove);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'onRegionChange' && onRegionChange) {
            onRegionChange(data.region);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
