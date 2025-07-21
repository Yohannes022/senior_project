import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, PermissionsAndroid, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Geolocation from '@react-native-community/geolocation';

export default function MapView({ 
  style, 
  initialRegion, 
  onRegionChange, 
  destination = null, 
  updateInterval = 10000, // 10 seconds
  onLocationUpdate = () => {}
}) {
  const webViewRef = useRef(null);
  const watchId = useRef(null);
  const lastPosition = useRef(null);
  const routeLayer = useRef(null);
  
  // Request location permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  // Watch user's position
  const watchPosition = () => {
    watchId.current = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        lastPosition.current = { latitude, longitude };
        onLocationUpdate({ latitude, longitude });
        
        // Update map with new position
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(`
            if (window.currentLocation) {
              currentLocation.setLatLng([${latitude}, ${longitude}]);
              map.setView([${latitude}, ${longitude}]);
              ${destination ? 'updateRoute();' : ''}
            } else {
              window.currentLocation = L.marker([${latitude}, ${longitude}], {
                icon: L.divIcon({
                  html: '<div style=\"background-color: #4285F4; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;\"></div>',
                  className: 'current-location',
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })
              }).addTo(map);
              ${destination ? 'updateRoute();' : ''}
            }
          `);
        }
      },
      (error) => console.log('Geolocation error:', error),
      { 
        enableHighAccuracy: true, 
        distanceFilter: 5, // Update every 5 meters
        interval: 5000, // Check every 5 seconds
        fastestInterval: 2000 // Fastest update interval in milliseconds
      }
    );
  };

  // Initialize location watching
  useEffect(() => {
    const initLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        watchPosition();
      }
    };
    
    initLocation();
    
    return () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
      }
    };
  }, []);
  
  // Update route when destination changes
  useEffect(() => {
    if (destination && lastPosition.current) {
      updateRoute();
    }
  }, [destination]);

  // Function to update the route
  const updateRoute = () => {
    if (webViewRef.current && lastPosition.current && destination) {
      webViewRef.current.injectJavaScript(`
        if (window.OSRM) {
          const start = [${lastPosition.current.longitude}, ${lastPosition.current.latitude}];
          const end = [${destination.longitude}, ${destination.latitude}];
          
          const url = \`https://router.project-osrm.org/route/v1/driving/\${start.join(',')};\${end.join(',')}?overview=full&geometries=geojson\`;
          
          fetch(url)
            .then(res => res.json())
            .then(data => {
              if (data.routes && data.routes[0]) {
                if (window.routeLayer) {
                  map.removeLayer(routeLayer);
                }
                
                window.routeLayer = L.geoJSON({
                  type: 'Feature',
                  properties: {},
                  geometry: data.routes[0].geometry
                }, {
                  style: {
                    color: '#4285F4',
                    weight: 5,
                    opacity: 0.8
                  }
                }).addTo(map);
                
                // Fit the map to the route bounds
                const bounds = window.routeLayer.getBounds();
                map.fitBounds(bounds, { padding: [50, 50] });
              }
            })
            .catch(err => console.error('Routing error:', err));
        } else {
          // Load OSRM script if not loaded
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/osrm.js@1.0.0/dist/osrm.js';
          script.onload = function() {
            window.OSRM = require('osrm');
            updateRoute();
          };
          document.head.appendChild(script);
        }
      `);
    }
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <style>
        body { margin: 0; padding: 0; }
        #map { 
          width: 100%; 
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          z-index: 1;
        }
        .current-location {
          background-color: #4285F4;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 5px rgba(0,0,0,0.3);
        }
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
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data);
          if (data.type === 'onRegionChange' && onRegionChange) {
            onRegionChange(data.region);
          }
        }}
        onLoadEnd={() => {
          // Initialize the map when WebView is loaded
          if (lastPosition.current) {
            webViewRef.current.injectJavaScript(`
              window.currentLocation = L.marker([${lastPosition.current.latitude}, ${lastPosition.current.longitude}], {
                icon: L.divIcon({
                  html: '<div style=\"background-color: #4285F4; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white;\"></div>',
                  className: 'current-location',
                  iconSize: [20, 20],
                  iconAnchor: [10, 10]
                })
              }).addTo(map);
              
              // Add OSRM script for routing
              const script = document.createElement('script');
              script.src = 'https://unpkg.com/osrm.js@1.0.0/dist/osrm.js';
              script.onload = function() {
                window.OSRM = require('osrm');
                ${destination ? 'updateRoute();' : ''}
              };
              document.head.appendChild(script);
              
              // Make updateRoute available globally
              window.updateRoute = function() {
                if (!window.OSRM) return;
                
                const start = [${lastPosition.current.longitude}, ${lastPosition.current.latitude}];
                const end = [${destination ? destination.longitude : '0'}, ${destination ? destination.latitude : '0'}];
                
                const url = \`https://router.project-osrm.org/route/v1/driving/\${start.join(',')};\${end.join(',')}?overview=full&geometries=geojson\`;
                
                fetch(url)
                  .then(res => res.json())
                  .then(data => {
                    if (data.routes && data.routes[0]) {
                      if (window.routeLayer) {
                        map.removeLayer(window.routeLayer);
                      }
                      
                      window.routeLayer = L.geoJSON({
                        type: 'Feature',
                        properties: {},
                        geometry: data.routes[0].geometry
                      }, {
                        style: {
                          color: '#4285F4',
                          weight: 5,
                          opacity: 0.8
                        }
                      }).addTo(map);
                      
                      // Add destination marker if not exists
                      if (!window.destinationMarker) {
                        window.destinationMarker = L.marker([${destination ? destination.latitude : '0'}, ${destination ? destination.longitude : '0'}], {
                          icon: L.divIcon({
                            html: '<div style=\"background-color: #EA4335; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white;\"></div>',
                            className: 'destination-marker',
                            iconSize: [16, 16],
                            iconAnchor: [8, 8]
                          })
                        }).addTo(map);
                      }
                      
                      // Fit the map to the route bounds
                      const bounds = L.latLngBounds([
                        [${lastPosition.current.latitude}, ${lastPosition.current.longitude}],
                        [${destination ? destination.latitude : '0'}, ${destination ? destination.longitude : '0'}]
                      ]);
                      map.fitBounds(bounds, { padding: [50, 50] });
                    }
                  })
                  .catch(err => console.error('Routing error:', err));
              };
            `);
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
