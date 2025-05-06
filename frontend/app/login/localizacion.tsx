import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
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
    
    <View style={styles.container}>
      <Text style={styles.title}>Localización</Text>
      
      {/* Pasar la referencia a LightWebCesiumMap */}
      <View style={styles.mapContainer}>
        <LightWebCesiumMap coords={coords} height={500} ref={mapRef} interactive={true} />
      </View>

      {/* Información de coordenadas */}
      {coords && (
        <View style={styles.coordsContainer}>
          <Text style={styles.coordsText}>
            Lat: {coords.latitude.toFixed(4)}, Lon: {coords.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      {/* Botón Geolocalizar */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleGeolocalizar}
          disabled={loading}
          style={styles.button}
        >
          <Text style={styles.buttonText}>
            {loading ? "Localizando..." : "Geolocalizarme"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EDE0',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  mapContainer: {
    height: 400,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  coordsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  coordsText: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#C76F40',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
}) ;
