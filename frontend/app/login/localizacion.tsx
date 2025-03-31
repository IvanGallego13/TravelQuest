import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useUbicacion } from "@/hooks/useUbicacion";

export default function Geolocalizacion() {
  const router = useRouter();
  const { setUbicacion } = useUbicacion();
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleGeolocalizar = async () => {
    setLoading(true);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permiso de localización denegado");
      setLoading(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const lugares = await Location.reverseGeocodeAsync({ latitude, longitude });
    const ciudad = lugares[0]?.city || lugares[0]?.region || "Ubicación desconocida";

    // 💾 Guardar en Zustand (sin imagen estática de mapa)
    setUbicacion({ ciudad, latitude, longitude, imagen: "" });
    setCoords({ latitude, longitude });

    setTimeout(() => {
      router.replace("/(tabs)/crear");
    }, 1500);
  };

  return (
    <View className="flex-1">
      {/* 🌍 Mapa simple con Google Maps (react-native-maps) */}
      <MapView
        style={{ flex: 1 }}
        region={
          coords
            ? {
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : {
                latitude: 0,
                longitude: 0,
                latitudeDelta: 50,
                longitudeDelta: 50,
              }
        }
        showsUserLocation
      >
        {coords && <Marker coordinate={coords} />}
      </MapView>

      {/* 📍 Botón Geolocalizar */}
      <View className="absolute bottom-20 w-full items-center">
        <TouchableOpacity
          onPress={handleGeolocalizar}
          disabled={loading}
          className="bg-[#C76F40] px-6 py-4 rounded-xl"
        >
          <Text className="text-white font-bold text-lg">
            {loading ? "Localizando..." : "Geolocalizarme"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
/*import { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import MapboxGL from "@rnmapbox/maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useUbicacion } from "@/hooks/useUbicacion"; //  usamos el store externo tipado

// Configura tu token de Mapbox
const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN!;
MapboxGL.setAccessToken(MAPBOX_TOKEN);

export default function Geolocalizacion() {
  const cameraRef = useRef<MapboxGL.Camera>(null); // tipo correcto para evitar errores con flyTo y zoomTo
  const router = useRouter();
  const { setUbicacion } = useUbicacion();
  const [loading, setLoading] = useState(false);

  const handleGeolocalizar = async () => {
    setLoading(true);

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permiso de localización denegado");
      setLoading(false);
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    // Obtener ciudad o región con reverse geocoding
    const lugares = await Location.reverseGeocodeAsync({ latitude, longitude });
    const ciudad = lugares[0]?.city || lugares[0]?.region || "Ubicación desconocida";

    // Anima la cámara al punto actual
    cameraRef.current?.flyTo([longitude, latitude], 1000);
    cameraRef.current?.zoomTo(8, 1000);

      //Genera imagen estática desde Mapbox Static API
      const imagen = `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${longitude},${latitude},10/600x400?access_token=${MAPBOX_TOKEN}`;

    // Espera un poco para la animación y pasa a la siguiente pantalla
    setTimeout(() => {
      router.replace("/(tabs)/crear");
    }, 2000);
  };

  return (
    <View className="flex-1">*/
      /* Mapa de fondo */
     /* <MapboxGL.MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/satellite-streets-v12"
      >
        <MapboxGL.Camera
          ref={cameraRef}
          centerCoordinate={[0, 0]}
          zoomLevel={1.5}
          animationMode="flyTo"
          animationDuration={2000}
        />
      </MapboxGL.MapView>

      /* Botón Geolocalizar */
      /*<View className="absolute bottom-20 w-full items-center">
        <TouchableOpacity
          onPress={handleGeolocalizar}
          disabled={loading}
          className="bg-[#C76F40] px-6 py-4 rounded-xl"
        >
          <Text className="text-white font-bold text-lg">
            {loading ? "Localizando..." : "Geolocalizarme"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}*/
