import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet, ImageBackground} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useUbicacion } from "../../hooks/useUbicacion";
import { supabase } from "../../lib/supabase";
import LightWebCesiumMap from "../../components/3d-map/LightWebCesiumMap";

// Define the CesiumMapRef interface
interface CesiumMapRef {
  postMessage: (message: string) => void;
}

export default function Geolocalizacion() {
  const router = useRouter();
  const { setUbicacion } = useUbicacion();
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<CesiumMapRef>(null);

  // Coordenadas iniciales para mostrar el mundo completo
  const [initialCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: 0,  // Ecuador (centro del globo)
    longitude: 0,  // Meridiano de Greenwich (centro del globo)
  });

  // Inicializar el mapa con una vista global al cargar
  useEffect(() => {
    // Establecer coordenadas iniciales para mostrar el globo
    setCoords(initialCoords);
    
    // Crear una referencia al timer para poder limpiarlo después
    const timer = setTimeout(() => {
      if (mapRef.current) {
        // Configuramos la vista inicial para mostrar el globo completo
        mapRef.current.postMessage(JSON.stringify({
          type: 'viewEarth',
          height: 3000000, // Altura para ver el globo completo
          duration: 0 // Sin animación inicial
        }));
        
        // Después de un segundo, iniciamos la rotación suave
        const rotationTimer = setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.postMessage(JSON.stringify({
              type: 'rotate',
              duration: 30, // Rotación más larga
              speed: 0.0002 // Velocidad más lenta para una rotación suave
            }));
          }
        }, 1000);
        
        // Devolver una función de limpieza para el timer de rotación
        return () => clearTimeout(rotationTimer);
      }
    }, 500);
    
    // Devolver una función de limpieza para el timer principal
    return () => clearTimeout(timer);
  }, []);

  const handleGeolocalizar = async () => {
    setLoading(true);
    
    try {
      // 1. Solicitar permisos
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "No se puede acceder a la ubicación.");
        setLoading(false);
        return;
      }

      // 2. Obtener coordenadas
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setCoords({ latitude, longitude });

      // Use the component-level ref instead of creating a new one
      if (mapRef.current) {
        const message = JSON.stringify({
          type: 'flyTo',
          latitude,
          longitude,
          height: 10000,
          duration: 2
        });
        mapRef.current.postMessage(message);
      }

      // 3. Obtener ciudad y país
      const lugares = await Location.reverseGeocodeAsync({ latitude, longitude });
      const ciudad = lugares[0]?.city || lugares[0]?.region || "Ciudad desconocida";
      const pais = lugares[0]?.country || "País desconocido";

      // 4. Buscar ciudad en Supabase
      const { data: existingCity, error: findError } = await supabase
        .from("cities")
        .select("*")
        .ilike("name", ciudad)
        .eq("country", pais)
        .maybeSingle();

      if (findError) {
        console.error("Error buscando ciudad:", findError.message);
        Alert.alert("Error", "No se pudo buscar la ciudad en la base de datos.");
        setLoading(false);
        return;
      }

      let ciudadFinal;

      if (!existingCity) {
        // 5. Crear ciudad si no existe
        const { data: newCity, error: insertError } = await supabase
          .from("cities")
          .insert([{ name: ciudad, country: pais }])
          .select()
          .single();

        if (insertError) {
          console.error("Error insertando ciudad:", insertError.message);
          Alert.alert("Error", "No se pudo guardar la ciudad en la base de datos.");
          setLoading(false);
          return;
        }

        ciudadFinal = newCity;
      } else {
        ciudadFinal = existingCity;
      }

      // 6. Guardar ubicación en Zustand
      setUbicacion({
        city: ciudad,
        latitude,
        longitude,
        imagen: "", // puedes generar una imagen del mapa más adelante
        cityId: ciudadFinal.id,
      });

      setTimeout(() => {
        // 7. Navegar a la pantalla siguiente
        router.replace("/(tabs)/crear");
      }, 2000);
    } catch (err) {
      console.error("Error geolocalizando:", err);
      Alert.alert("Error", "Ocurrió un problema al obtener tu ubicación.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ImageBackground
      source={require('../../assets/images/fondo.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1  p-4">

        <Text className="text-xl font-bold text-center text-black mb-16 mt-10 bg-white/80 px-4 py-2 rounded-xl">
          Localización
        </Text>

        <View className="h-[400px] rounded-xl overflow-hidden mb-4 bg-white/80">
          <LightWebCesiumMap coords={coords} height={500} ref={mapRef} interactive={true} />
        </View>

        {coords && (
          <View className="bg-white/80 px-4 py-3 rounded-xl mt-3 mb-4 items-center">
            <Text className="text-black font-medium">
              Lat: {coords.latitude.toFixed(4)}, Lon: {coords.longitude.toFixed(4)}
            </Text>
          </View>
        )}

        <View className="items-center">
          <TouchableOpacity
            onPress={handleGeolocalizar}
            disabled={loading}
            className="bg-white/90 px-6 py-4 rounded-2xl shadow-md"
            >
            <Text className="text-black font-bold text-lg">
              {loading ? 'Localizando...' : 'Geolocalizarme'}
            </Text>
          </TouchableOpacity>
        </View>
        
      </View>
    </ImageBackground>
  );
}
