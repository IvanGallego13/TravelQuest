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
  
  // Siempre usar LightWebCesiumMap para asegurar que tengamos Cesium en 3D
  return <LightWebCesiumMap coords={coords} height={height} ref={ref} interactive={interactive} />;
});

export default CesiumMap;