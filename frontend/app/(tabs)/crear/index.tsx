import { Text, View, TouchableOpacity, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useUbicacion } from "@/hooks/useUbicacion";
import MapView, { Marker } from "react-native-maps";


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
  return (
    <View className="flex-1 px-6 pt-12 bg-[#F4EDE0]">
      {/* Ciudad */}
      <Text className="text-xl font-bold text-black border-b border-gray-400 mb-6">
        {ubicacion?.ciudad || "Ubicación..."}
      </Text>
  
      {/* Mapa ilustrativo con Marker */}
      {ubicacion?.latitude && ubicacion?.longitude ? (
        <MapView
          style={{ height: 200, borderRadius: 12, marginBottom: 24 }}
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
      ) : (
        <View className="w-full h-48 bg-gray-300 rounded-xl items-center justify-center mb-6">
          <Text className="text-gray-700">Cargando mapa...</Text>
        </View>
      )}
  
      {/* Botones */}
      <View className="mt-10">
        <TouchableOpacity
          className="w-full items-center px-6 py-4 rounded-xl bg-[#C76F40] mb-5"
          onPress={irASeleccionDificultad}
        >
          <Text className="text-white text-lg font-semibold">Comenzar una misión</Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          className="w-full items-center px-6 py-4 rounded-xl bg-[#699D81]"
          onPress={irAEditarDiario}
        >
          <Text className="text-white text-lg font-semibold">Rellenar cuaderno de viaje</Text>
        </TouchableOpacity>
      </View>
    </View>
  );  
  
}