import React, { forwardRef, useRef, useState, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent } from 'react-native-webview';

const CESIUM_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxZTlhYjgxOS0yNjA4LTQzY2ItYTNiZS03NTZhY2Q3NzI0MTAiLCJpZCI6MjkyODE5LCJpYXQiOjE3NDQ2NDgzODR9.KaJJ8putsj5CXxilima3qBW27ha0sd8R6M3XOrsXtLc';

interface LightWebCesiumMapProps {
  coords: { latitude: number; longitude: number; height?: number } | null;
  height?: number;
  interactive?: boolean;
}

const LightWebCesiumMap = forwardRef(({ coords, height = 400, interactive = true }: LightWebCesiumMapProps, ref) => {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    postMessage: (message: string) => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(message);
      }
    }
  }));

  // HTML ultra simplificado para móviles
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Simple Earth</title>
      <script src="https://cesium.com/downloads/cesiumjs/releases/1.104/Build/Cesium/Cesium.js"></script>
      <link href="https://cesium.com/downloads/cesiumjs/releases/1.104/Build/Cesium/Widgets/widgets.css" rel="stylesheet">
      <style>
        html, body, #cesiumContainer { 
          width: 100%; 
          height: 100%; 
          margin: 0; 
          padding: 0; 
          overflow: hidden; 
          background-color: black;
        }
        .cesium-viewer-bottom,
        .cesium-viewer-timelineContainer,
        .cesium-viewer-animationContainer,
        .cesium-viewer-toolbar,
        .cesium-viewer-fullscreenContainer {
          display: none !important;
        }
      </style>
    </head>
    <body>
      <div id="cesiumContainer"></div>
      
      <script>
        try {
          Cesium.Ion.defaultAccessToken = '${CESIUM_TOKEN}';
          
          // Configuración ultra simple para mejor rendimiento
          const viewer = new Cesium.Viewer('cesiumContainer', {
            baseLayerPicker: false,
            geocoder: false,
            homeButton: false,
            infoBox: false,
            sceneModePicker: false,
            selectionIndicator: false,
            timeline: false,
            navigationHelpButton: false,
            animation: false,
            creditContainer: document.createElement('div'), // Ocultar créditos
            terrainProvider: new Cesium.EllipsoidTerrainProvider(), // Terreno básico
            imageryProvider: new Cesium.IonImageryProvider({
              assetId: 3 // Mapa base de Cesium (Bing Maps Aerial)
            }),
            scene3DOnly: true,
            shouldAnimate: true
          });
          
          // Configuración para mejor visualización
          viewer.scene.globe.enableLighting = false;
          viewer.scene.fog.enabled = false;
          viewer.scene.skyAtmosphere.show = true;
          viewer.scene.globe.showGroundAtmosphere = true;
          viewer.scene.backgroundColor = Cesium.Color.BLACK;
          
          // Asegurarnos que el globo sea visible
          viewer.scene.globe.show = true;
          
          // Ajustes de calidad y rendimiento
          viewer.resolutionScale = 1.4;
          viewer.scene.globe.maximumScreenSpaceError = 2;
          
          // Configurar vista inicial para ver el globo completo y centrado
          viewer.camera.setView({
            destination: Cesium.Cartesian3.fromDegrees(0, 0, 800000), // Altura ajustada para ver el globo completo
            orientation: {
              heading: 0.0,
              pitch: -0.7, // Ajustado para ver el globo desde arriba y centrado
              roll: 0.0
            }
          });
          
          // Limitar el zoom para evitar problemas
          viewer.scene.screenSpaceCameraController.minimumZoomDistance = 5000000;
          viewer.scene.screenSpaceCameraController.maximumZoomDistance = 25000000;
          
          // Notificar cuando esté listo
          setTimeout(() => {
            window.ReactNativeWebView.postMessage('mapLoaded');
          }, 1000);
          
          // Manejar mensajes
          document.addEventListener('message', function(event) {
            try {
              const message = JSON.parse(event.data);
              if (message.type === 'flyTo' && message.latitude && message.longitude) {
                viewer.camera.flyTo({
                  destination: Cesium.Cartesian3.fromDegrees(
                    message.longitude,
                    message.latitude,
                    message.height || 1200000
                  ),
                  orientation: {
                    heading: 0.0,
                    pitch: -1.3, // Ajustado para ver el globo centrado
                    roll: 0.0
                  },
                  duration: 2
                });
              } else if (message.type === 'viewEarth') {
                // Para volver a la vista del mundo completo
                viewer.camera.flyTo({
                  destination: Cesium.Cartesian3.fromDegrees(0, 0, message.height || 8000000),
                  orientation: {
                    heading: 0.0,
                    pitch: -1.3, // Ajustado para ver el globo desde arriba y centrado
                    roll: 0.0
                  },
                  duration: message.duration || 2
                });
              } else if (message.type === 'rotate') {
                // Rotación suave
                let rotationEvent = viewer.clock.onTick.addEventListener(function() {
                  viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, message.speed || 0.0005);
                });
                
                if (message.duration) {
                  setTimeout(() => {
                    viewer.clock.onTick.removeEventListener(rotationEvent);
                  }, message.duration * 1000);
                }
              }
            } catch (e) {
              console.error(e);
            }
          });
          
          // Si hay coordenadas, volar a ellas después de mostrar el mundo
          ${coords ? `
            // Primero mostramos el mundo completo
            setTimeout(() => {
              viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(
                  ${coords.longitude},
                  ${coords.latitude},
                  ${coords.height || 2000000} // Aumentado para ver más contexto
                ),
                orientation: {
                  heading: 0.0,
                  pitch: -0.3, // Ajustado para ver más centrado
                  roll: 0.0
                },
                duration: 2
              });
            }, 2000); // Esperar 2 segundos antes de volar a la ubicación
          ` : ''}
          
        } catch (error) {
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
          setError(parsedData.message);
        }
      } catch (e) {
        // No es JSON, ignorar
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
        style={{ flex: 1, backgroundColor: 'black' }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
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
    backgroundColor: '#000000',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ffffff',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  }
});

export default LightWebCesiumMap;