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

  // Define the handleMessage function to fix the error
  const handleMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    if (data === 'mapLoaded') {
      setIsLoading(false);
    } else {
      try {
        const parsedData = JSON.parse(data);
        if (parsedData.type === 'error') {
          console.error('Cesium error:', parsedData.message);
          setError(parsedData.message);
        }
      } catch (e) {
        // Not JSON, ignore
      }
    }
  };

  // HTML simplificado para mostrar el globo terráqueo
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <title>Earth View</title>
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
          touch-action: none;
          position: relative;
        }
        .cesium-viewer-bottom,
        .cesium-viewer-timelineContainer,
        .cesium-viewer-animationContainer,
        .cesium-viewer-toolbar,
        .cesium-viewer-fullscreenContainer,
        .cesium-widget-credits {
          display: none !important;
        }
      </style>
    </head>
    <body>
      <div id="cesiumContainer"></div>
      
      <script>
        // Esperar a que todo esté cargado
        window.onload = function() {
          try {
            // Configuración básica
            Cesium.Ion.defaultAccessToken = '${CESIUM_TOKEN}';
            
            // Configuración simplificada del visor
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
              fullscreenButton: false,
              creditContainer: document.createElement('div'),
              imageryProvider: new Cesium.IonImageryProvider({ assetId: 3 }),
              terrainProvider: Cesium.createWorldTerrain({
                requestVertexNormals: false,
                requestWaterMask: false
              })
            });
            
            // Ocultar elementos de la interfaz
            viewer.cesiumWidget.creditContainer.style.display = 'none';
            
            // CRÍTICO: Asegurarse de que el globo esté visible
            viewer.scene.globe.show = true;
            viewer.scene.globe.enableLighting = false;
            viewer.scene.skyAtmosphere.show = true;
            viewer.scene.globe.showGroundAtmosphere = false;
            viewer.scene.fog.enabled = false;
            viewer.scene.backgroundColor = Cesium.Color.BLACK;
            
            // Forzar un renderizado inicial
            viewer.scene.requestRender();
            
            // Función para asegurar que el globo sea visible y centrado
            function setupEarthView() {
              // Posicionar la cámara para ver el globo terráqueo centrado
              viewer.camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(20, 15, 2000000), // Reducido para ver el globo más grande
                orientation: {
                  heading: 0.0,
                  pitch: -0.3,
                  roll: 0.0
                }
              });
              
              // Forzar otro renderizado después de configurar la vista
              viewer.scene.requestRender();
              
              // Notificar cuando el mapa esté listo
              window.ReactNativeWebView.postMessage('mapLoaded');
            }
            
            // Ejecutar la configuración inicial después de un breve retraso
            setTimeout(setupEarthView, 500);
            
            // Limitar el zoom para evitar salir al espacio pero permitir acercarse más
            viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1500000;
            viewer.scene.screenSpaceCameraController.maximumZoomDistance = 20000000;
            
            // Manejar mensajes desde React Native
            document.addEventListener('message', function(event) {
              try {
                const message = JSON.parse(event.data);
                
                if (message.type === 'flyTo' && message.latitude && message.longitude) {
                  viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(
                      message.longitude,
                      message.latitude,
                      message.height || 10000
                    ),
                    orientation: {
                      heading: 0.0,
                      pitch: -0.5,
                      roll: 0.0
                    },
                    duration: 2
                  });
                } else if (message.type === 'viewEarth') {
                  // Ajustado para mostrar el globo terráqueo más grande y centrado
                  viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(20, 15, message.height || 2000000),
                    orientation: {
                      heading: 0.0,
                      pitch: -0.3,
                      roll: 0.0
                    },
                    duration: 0
                  });
                  
                  // Forzar renderizado después de cambiar la vista
                  viewer.scene.requestRender();
                } else if (message.type === 'rotate') {
                  // Iniciar rotación automática
                  const rotateFactor = message.speed || 0.0005;
                  viewer.clock.onTick.addEventListener(function() {
                    viewer.scene.camera.rotate(Cesium.Cartesian3.UNIT_Z, rotateFactor);
                    // Forzar renderizado durante la rotación
                    viewer.scene.requestRender();
                  });
                }
              } catch (e) {
                console.error(e);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'error',
                  message: e.message || 'Error processing message'
                }));
              }
            });
          } catch (error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'error',
              message: error.message || 'Error initializing Cesium'
            }));
          }
        };
      </script>
    </body>
    </html>
  `;

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
        scrollEnabled={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setError(`WebView error: ${nativeEvent.description}`);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          setError(`HTTP error: ${nativeEvent.statusCode}`);
        }}
        onLoad={() => {
          // Forzar la ocultación del indicador de carga después de 5 segundos
          setTimeout(() => setIsLoading(false), 5000);
        }}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#699D81" />
          <Text style={styles.loadingText}>Cargando mapa 3D...</Text>
        </View>
      )}
      {error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
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
  errorOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    padding: 10,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  }
});

export default LightWebCesiumMap;