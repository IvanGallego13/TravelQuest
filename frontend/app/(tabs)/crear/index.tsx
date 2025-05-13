import { Text, View, TouchableOpacity, Alert, ImageBackground } from "react-native";
import { useRouter } from "expo-router";
import { useUbicacion } from "../../../hooks/useUbicacion";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from '@expo/vector-icons'; // Add this import for the arrow icon


export default function OpcionesDeCrear() {
  const router = useRouter();
  const { ubicacion } = useUbicacion();
  
  const irASeleccionDificultad = ()=>{
    if (!ubicacion?.cityId) {
      Alert.alert("Error", "No se ha detectado ninguna ciudad.");
      return;
    }
    router.push({
      pathname: "/(tabs)/crear/2dificultad",
      params: { cityId: ubicacion.cityId.toString() },
    });
  };
  
  const irAEditarDiario =()=>{
    router.push("./crear/2.2entradaDiario");
  };

  // Add this function to navigate back to the location screen
  const irALocalizacion = () => {
    router.push("/login/localizacion");
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/caminante.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Capa blanca translúcida para aclarar imagen */}
      <View className="flex-1 px-6 pt-12 bg-white/20">
        
        {/* Add back arrow button */}
        <TouchableOpacity 
          onPress={irALocalizacion}
          className="absolute top-12 left-6 z-10 bg-white/80 p-2 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="#699D81" />
        </TouchableOpacity>

        {/* Ciudad como etiqueta moderna - Moved more to the right */}
        <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-4 flex-row items-center gap-2 ml-14">
          <Text className="text-black text-lg font-semibold">
            {ubicacion?.city || "Ubicación..."}
          </Text>
          <Text className="text-black text-xl">📍</Text>
        </View>

        {/* Mapa dentro de un marco blanco redondeado */}
        {ubicacion?.latitude && ubicacion?.longitude ? (
          <View className="bg-white/80 p-2 rounded-3xl shadow-lg mb-10">
            <View className="overflow-hidden rounded-2xl">
              <MapView
                style={{ height: 200, width: '100%' }}
                region={{
                  latitude: ubicacion.latitude,
                  longitude: ubicacion.longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: ubicacion.latitude,
                    longitude: ubicacion.longitude,
                  }}
                />
              </MapView>
            </View>
          </View>
        ) : (
          <View className="bg-white/80 p-2 rounded-3xl shadow-lg mb-10">
            <View className="h-48 bg-gray-300/70 rounded-2xl items-center justify-center">
              <Text className="text-black">Cargando mapa...</Text>
            </View>
          </View>
        )}

        {/* Botones estilo tarjeta separados */}
        <View className="flex-col space-y-6 mb-6">
          <TouchableOpacity
            className="bg-white/80 px-6 py-4 mb-6 rounded-2xl shadow-md"
            onPress={irASeleccionDificultad}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-black font-bold text-lg">Comenzar una misión</Text>
                <Text className="text-black/60 text-sm">Acepta tu próximo reto</Text>
              </View>
              <Text className="text-black text-2xl">→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white/80 px-6 py-4 rounded-2xl shadow-md"
            onPress={irAEditarDiario}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-black font-bold text-lg">Rellenar cuaderno de viaje</Text>
                <Text className="text-black/60 text-sm">Agrega tus recuerdos</Text>
              </View>
              <Text className="text-black text-2xl">→</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
  
  
}