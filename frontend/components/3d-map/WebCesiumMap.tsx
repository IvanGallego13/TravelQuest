import React, { forwardRef, useRef, useState, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

// Your Cesium token
const CESIUM_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZTlhYjgxOS0yNjA4LTQzY2ItYTNiZS03NTZhY2Q3NzI0MTAiLCJpZCI6MjkyODE5LCJpYXQiOjE3NDQ2NDgzODR9.KaJJ8putsj5CXxilima3qBW27ha0sd8R6M3XOrsXtLc';

interface WebCesiumMapProps {
  coords: { latitude: number; longitude: number } | null;
  height?: number;
  interactive?: boolean;
}

const WebCesiumMap = forwardRef(({ coords, height = 400, interactive = true }: WebCesiumMapProps, ref) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    postMessage: (message: string) => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(message);
      }
    }
  }));

  // HTML content for the WebView with Cesium
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Cesium Map</title>
      <script src="https://cesium.com/downloads/cesiumjs/releases/1.104/Build/Cesium/Cesium.js"></script>
      <link href="https://cesium.com/downloads/cesiumjs/releases/1.104/Build/Cesium/Widgets/widgets.css" rel="stylesheet">
      <style>
        html, body, #cesiumContainer {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        #loadingOverlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .loading-text {
          font-family: Arial, sans-serif;
          font-size: 16px;
          color: #333;
          margin-top: 10px;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #699D81;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    </head>
    <body>
      <div id="cesiumContainer"></div>
      <div id="loadingOverlay">
        <div>
          <div class="spinner"></div>
          <div class="loading-text">Cargando mapa...</div>
        </div>
      </div>
      
      <script>
        try {
          // Initialize Cesium viewer with your token
          Cesium.Ion.defaultAccessToken = '${CESIUM_TOKEN}';
          
          // Add error handling for asset loading
          Cesium.TileProviderError.handleError = function(error) {
            console.warn('Cesium tile error:', error.message);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'tileError',
              message: error.message
            }));
            return true; // Prevent the default error handling
          };
          
          const viewer = new Cesium.Viewer('cesiumContainer', {
            terrainProvider: Cesium.createWorldTerrain(),
            imageryProvider: new Cesium.IonImageryProvider({ assetId: 96188 }), // Cesium OSM Buildings en lugar de Google Photorealistic
            animation: false,
            baseLayerPicker: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            navigationInstructionsInitiallyVisible: false,
            scene3DOnly: true,
            shouldAnimate: true
          });
          
          // Optimizaciones para mejorar el rendimiento en dispositivos móviles
          viewer.resolutionScale = 0.7; // Reduce la resolución al 70%
          viewer.scene.globe.maximumScreenSpaceError = 4; // Valor más alto = menos detalle pero mejor rendimiento
          viewer.scene.fog.enabled = false; // Desactivar niebla
          viewer.scene.skyAtmosphere.show = false; // Desactivar atmósfera
          
          // Hide the credit container
          viewer.cesiumWidget.creditContainer.style.display = "none";
          
          // Use a try-catch for terrain provider
          try {
            viewer.terrainProvider = Cesium.createWorldTerrain({
              requestVertexNormals: false, // Desactivar normales para mejorar rendimiento
              requestWaterMask: false // Desactivar máscara de agua para mejorar rendimiento
            });
          } catch (e) {
            console.warn('Failed to load world terrain, using ellipsoid instead');
            viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();
          }
          
          // Add error event listener
          viewer.scene.globe.tileLoadProgressEvent.addEventListener(function(count) {
            if (count === 0) {
              document.getElementById('loadingOverlay').style.display = 'none';
            }
          });
          
          // Handle terrain loading errors
          viewer.terrainProvider.errorEvent.addEventListener(function(error) {
            console.warn('Terrain error:', error);
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'terrainError',
              message: error.message || 'Error loading terrain'
            }));
          });
          
          // Notify React Native that the map is loaded
          viewer.scene.globe.tileLoadProgressEvent.addEventListener(function(count) {
            if (count === 0) {
              window.ReactNativeWebView.postMessage('mapLoaded');
            }
          });
          
          // Set initial view to show the whole Earth
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(0, 0, 20000000),
            orientation: {
              heading: 0.0,
              pitch: -Cesium.Math.PI_OVER_TWO / 1.5, // Ángulo para ver desde arriba pero con perspectiva
              roll: 0.0
            },
            duration: 0
          });
          
          // Handle messages from React Native
          document.addEventListener('message', function(event) {
            try {
              const message = JSON.parse(event.data);
              
              if (message.type === 'flyTo') {
                viewer.camera.flyTo({
                  destination: Cesium.Cartesian3.fromDegrees(
                    message.longitude,
                    message.latitude,
                    message.height || 1000
                  ),
                  duration: message.duration || 2,
                  complete: function() {
                    // Notify that the flight has completed
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'flyToComplete'
                    }));
                  }
                });
              } else if (message.type === 'viewEarth') {
                // Configurar la vista para ver la Tierra completa desde el espacio
                viewer.camera.flyTo({
                  destination: Cesium.Cartesian3.fromDegrees(
                    0, // Longitud en el centro
                    0, // Latitud en el ecuador
                    message.height || 20000000 // Altura muy elevada para ver el planeta completo
                  ),
                  orientation: {
                    heading: 0.0,
                    pitch: -Cesium.Math.PI_OVER_TWO / 1.5, // Ángulo para ver desde arriba pero con perspectiva
                    roll: 0.0
                  },
                  duration: message.duration || 0
                });
              } else if (message.type === 'rotate') {
                // Añadir rotación automática del globo
                let rotationEvent = viewer.clock.onTick.addEventListener(function() {
                  viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, message.speed || 0.0005);
                });
                
                // Si se especifica una duración, detener la rotación después
                if (message.duration) {
                  setTimeout(() => {
                    viewer.clock.onTick.removeAll();
                  }, message.duration * 1000);
                }
              }
            } catch (error) {
              console.error('Error processing message:', error);
            }
          });
          
          // Set interactive mode based on props
          viewer.scene.screenSpaceCameraController.enableRotate = ${interactive};
          viewer.scene.screenSpaceCameraController.enableTranslate = ${interactive};
          viewer.scene.screenSpaceCameraController.enableZoom = ${interactive};
          viewer.scene.screenSpaceCameraController.enableTilt = ${interactive};
          viewer.scene.screenSpaceCameraController.enableLook = ${interactive};
          
          // If coordinates are provided, fly to them
          ${coords ? `
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(
                ${coords.longitude},
                ${coords.latitude},
                1000
              ),
              duration: 2
            });
            
            // Add a marker at the coordinates
            viewer.entities.add({
              position: Cesium.Cartesian3.fromDegrees(${coords.longitude}, ${coords.latitude}),
              billboard: {
                image: Cesium.buildModuleUrl('Assets/Textures/maki/marker.png'),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                scale: 0.5
              }
            });
          ` : ''}
          
        } catch (error) {
          console.error('Error initializing Cesium:', error);
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'error',
            message: error.message || 'Error initializing Cesium'
          }));
        }
      </script>
    </body>
    </html>
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    
    if (data === 'mapLoaded') {
      setIsLoading(false);
    } else {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.type === 'error') {
          console.error('WebView Error:', parsedData.message);
          setError(parsedData.message);
        }
      } catch (e) {
        // Not JSON, ignore
      }
    }
  };

  if (error) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={{ height, borderRadius: 12, overflow: 'hidden' }}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={{ flex: 1 }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#699D81" />
            <Text style={styles.loadingText}>Cargando mapa...</Text>
          </View>
        )}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#699D81" />
          <Text style={styles.loadingText}>Cargando mapa...</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  }
});

export default WebCesiumMap;
