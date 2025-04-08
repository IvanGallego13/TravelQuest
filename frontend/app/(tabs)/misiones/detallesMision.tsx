import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


//Simulación de datos reales
const datosSimulados = {
  titulo: "Misión Título",
  descripcion: "Texto en el cual se describe la misión",
  respuesta: "Aquí respondí a la misión con mi experiencia.",
  imagen: "https://via.placeholder.com/600x400", // URL simulada de imagen
};

export default function DetalleMisionCompletada() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // ← ID de la misión, se usará con fetch real

  return (
    <View className="flex-1 bg-[#F4EDE0] relative">
      {/*Flecha para retroceder UNA pantalla */}
      <TouchableOpacity onPress={() => router.back()} className="absolute top-10 left-4 z-10">
        <Ionicons name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 80 }}>
        {/* Título */}
        <Text className="text-lg font-bold text-black mb-1">{datosSimulados.titulo}</Text>
        <View className="h-0.5 bg-black w-2/3 mb-4" />

        {/* Descripción */}
        <Text className="text-black text-base mb-4">{datosSimulados.descripcion}</Text>

        {/*Respuesta del usuario */}
        <Text className="text-black font-semibold mb-2">Tu respuesta:</Text>
        <View className="bg-white border-[2px] border-[#699D81] rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-black">{datosSimulados.respuesta}</Text>
        </View>

        {/*Imagen subida */}
        <Text className="text-black font-semibold mb-2">Foto que subiste:</Text>
        <Image
          source={{ uri: datosSimulados.imagen }}
          className="w-full h-60 rounded-xl bg-gray-300 shadow-md"
          resizeMode="cover"
        />
      </ScrollView>
    </View>
  );
}
