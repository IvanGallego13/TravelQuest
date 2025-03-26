import { Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

interface Props {
  ciudad: string; // ciudad obtenida por geolocalización
}

export default function OpcionesDeCrear() {
  const router = useRouter();
  const irASeleccionDificultad = ()=>{
    router.push("./crear/2dificultad");
  };
  const irAEditarDiario =()=>{
    router.push("./crear/2.2entradaDiario");
  };

  return (
    <View className="flex-1 px-6 pt-12 bg-[#F4EDE0] ">
      {/* Ciudad */}
      <Text className="text-xl font-bold text-black border-b border-gray-400 mb-10">
       {/* {ciudad} */} Salamanca
      </Text>

      {/* Mapa (placeholder visual) */}
      <View className="w-full h-48 bg-gray-300 rounded-xl items-center justify-center">
        <Text className="text-gray-700">Mapa de la ciudad con Google Maps</Text>
      </View>

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
