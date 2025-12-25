import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { TERRITORY_POLYGON } from '../utils/geo';
const MapView = React.forwardRef(({ 
  userLocation, 
  userPath, 
  regions = [],
  onReady 
}, ref) => {
  const webViewRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const generateLeafletHTML = () => {
    const bounds = TERRITORY_POLYGON.geometry.coordinates[0];
    const centerLat = (bounds[0][1] + bounds[2][1]) / 2;
    const centerLng = (bounds[0][0] + bounds[2][0]) / 2;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
        <style>
          * { margin: 0; padding: 0; }
          body { overflow: hidden; }
          #map { position: absolute; top: 0; bottom: 0; width: 100%; height: 100%; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
        <script>
          let mapInstance = null;
          let territoryLayer = null;
          let userMarker = null;
          let userPolyline = null;
          let regionLayers = {}; // Maps regionId -> L.Polygon

          function initializeMap() {
            if (mapInstance) return;
            
            console.log('Initializing map...');
            mapInstance = L.map('map').setView([${centerLat}, ${centerLng}], 16);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '© OpenStreetMap contributors',
              maxZoom: 19
            }).addTo(mapInstance);

            // Territory polygon
            territoryLayer = L.geoJSON(${JSON.stringify(TERRITORY_POLYGON)}, {
              style: {
                color: '#3388ff',
                weight: 2,
                opacity: 0.7,
                fill: true,
                fillColor: '#3388ff',
                fillOpacity: 0.3
              }
            }).addTo(mapInstance);
            try {
              const tb = territoryLayer.getBounds();
              if (tb && tb.isValid && tb.isValid()) {
                mapInstance.fitBounds(tb, { padding: [20, 20] });
              }
            } catch (e) {
              console.error('Error fitting bounds:', e);
            }
            console.log('✓ Map initialized successfully');
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'MAP_READY' }));
          }
          window.handleMapUpdate = function(data) {
            if (!mapInstance) {
              console.log('Map not ready yet, initializing...');
              initializeMap();
            }
            console.log('handleMapUpdate called with:', JSON.stringify(data));
            if (data.userLocation && data.userLocation.latitude !== null && data.userLocation.longitude !== null) {
              const { latitude, longitude } = data.userLocation;
              console.log('Updating user marker to:', latitude, longitude);
              if (!userMarker) {
                userMarker = L.circleMarker([latitude, longitude], {
                  radius: 8,
                  fillColor: '#ff7800',
                  color: '#fff',
                  weight: 2,
                  opacity: 1,
                  fillOpacity: 0.8
                }).addTo(mapInstance);
                console.log('✓ Created user marker');
              } else {
                userMarker.setLatLng([latitude, longitude]);
                console.log('✓ Updated user marker');
              }              
              mapInstance.panTo([latitude, longitude]);
            } else {
              console.log('No valid user location:', data.userLocation);
            }
            // Update user path
            if (data.userPath && Array.isArray(data.userPath) && data.userPath.length > 0) {
              console.log('Updating path with', data.userPath.length, 'points');
              if (userPolyline) {
                mapInstance.removeLayer(userPolyline);
              }             
              userPolyline = L.polyline(
                data.userPath.map(p => [p.latitude, p.longitude]),
                {
                  color: '#ff0000',
                  weight: 3,
                  opacity: 0.7,
                  dashArray: '5, 5'
                }
              ).addTo(mapInstance);
              console.log('✓ Updated path');
            }
            if (data.regions && Array.isArray(data.regions)) {
              console.log('Updating', data.regions.length, 'regions');
              // Remove regions that no longer exist
              const existingIds = Object.keys(regionLayers);
              const currentIds = data.regions.map(r => r.id);
              existingIds.forEach(id => {
                if (!currentIds.includes(id)) {
                  mapInstance.removeLayer(regionLayers[id]);
                  delete regionLayers[id];
                }
              });
              data.regions.forEach(region => {
                if (!region.polygon) return;               
                const colors = {
                  RED: '#ff4444',
                  BLUE: '#4444ff',
                  GREEN: '#44ff44'
                };
                const color = colors[region.ownerTeam] || '#3388ff';
                if (regionLayers[region.id]) {
                  // Update existing
                  regionLayers[region.id].setStyle({
                    color: color,
                    fillColor: color
                  });
                } else {
                  const geoJSON = region.polygon;
                  regionLayers[region.id] = L.geoJSON(geoJSON, {
                    style: {
                      color: color,
                      weight: 2,
                      opacity: 0.8,
                      fill: true,
                      fillColor: color,
                      fillOpacity: 0.4
                    }
                  }).addTo(mapInstance);
                }
              });
              console.log('✓ Updated regions');
            }
          };
          window.addEventListener('load', function() {
            console.log('Page loaded, initializing map...');
            initializeMap();
          });
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeMap);
          } else {
            initializeMap();
          }
        </script>
      </body>
      </html>
    `;
  };
  const html = generateLeafletHTML();
  useEffect(() => {
    if (webViewRef.current && mapReady) {
      const messageData = {
        userLocation: userLocation,
        userPath: userPath || [],
        regions: regions || []
      };
      console.log('Sending map update with', regions.length, 'regions');
      webViewRef.current.injectJavaScript(`
        window.handleMapUpdate(${JSON.stringify(messageData)});
        true;
      `);
    }
  }, [userLocation, userPath, regions, mapReady]);
  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            console.log('WebView message:', data);
            if (data.type === 'MAP_READY') {
              console.log('✓ Map is ready!');
              setMapReady(true);
              if (onReady) {
                onReady();
              }
            }
          } catch (error) {
            console.error('Error parsing WebView message:', error);
          }
        }}
        style={{ flex: 1 }}
        scrollEnabled={true}
        zoomEnabled={true}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
      />
    </View>
  );
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default MapView;
