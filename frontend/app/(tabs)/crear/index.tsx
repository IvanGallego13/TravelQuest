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
      source={require('../../../assets/images/fondo.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Capa blanca translúcida para aclarar imagen */}
      <View className="flex-1 px-6 pt-12">

        {/* Botón volver */}
        <TouchableOpacity 
          onPress={irALocalizacion}
          className="absolute top-12 left-6 z-10 bg-white/80 p-2 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* Etiqueta de ciudad */}
        <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-4 flex-row items-center gap-2 ml-14">
          <Text className="text-black text-lg font-semibold">
            {ubicacion?.city || "Explorando..."}
          </Text>
          <Text className="text-black text-xl">📍</Text>
        </View>

        {/* Mapa */}
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
              <Text className="text-black">Preparando el mapa...</Text>
            </View>
          </View>
        )}

        {/* Tarjeta contenedora para las acciones */}
        <View className="bg-white/80 rounded-2xl p-4 shadow-md space-y-4 mb-10">
          {/* Botón iniciar misión */}
          <TouchableOpacity
            className="bg-white px-4 py-4 mb-5 rounded-xl border border-gray-200 shadow-sm"
            onPress={irASeleccionDificultad}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-black font-bold text-lg">🧭 Iniciar nueva misión</Text>
                <Text className="text-black/60 text-sm">Desbloquea una nueva aventura</Text>
              </View>
              <Text className="text-black text-2xl">→</Text>
            </View>
          </TouchableOpacity>

          {/* Botón escribir en diario */}
          <TouchableOpacity
            className="bg-white px-4 py-4 rounded-xl border border-gray-200 shadow-sm"
            onPress={irAEditarDiario}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-black font-bold text-lg">📓 Escribir en el diario</Text>
                <Text className="text-black/60 text-sm">Captura tus recuerdos del viaje</Text>
              </View>
              <Text className="text-black text-2xl">→</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}