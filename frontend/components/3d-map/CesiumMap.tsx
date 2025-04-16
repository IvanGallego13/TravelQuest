import React, { forwardRef } from 'react';
import { Platform } from 'react-native';
import WebCesiumMap from './WebCesiumMap';
import LightWebCesiumMap from './LightWebCesiumMap';
import NativeCesiumMap from './NativeCesiumMap';

interface CesiumMapProps {
  coords: { latitude: number; longitude: number; height?: number } | null;
  height?: number;
  interactive?: boolean;
}

const CesiumMap = forwardRef(({ coords, height = 400, interactive = true }: CesiumMapProps, ref) => {
  console.log('Platform.OS:', Platform.OS);
  
  if (Platform.OS === 'web') {
    // Versión completa para web
    return <WebCesiumMap coords={coords} height={height} ref={ref} interactive={interactive} />;
  } else {
    // Intentar versión ultra-ligera para móviles
    return <LightWebCesiumMap coords={coords} height={height} ref={ref} interactive={interactive} />;
    
    // Si la versión ligera no funciona, descomenta esta línea y comenta la anterior
    // return <NativeCesiumMap coords={coords} height={height} ref={ref} interactive={interactive} />;
  }
});

export default CesiumMap;