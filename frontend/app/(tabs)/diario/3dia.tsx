import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function DiaDetalle() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Simulación de los datos de un día (en una app real, se recuperaría de la base de datos)
  const dia = {
    id,
    titulo: "Día Seleccionado",
    descripcion: "Descripción que hace el usuario de su día.",
    imagen: require("@/assets/images/icon.png"), // Reemplazar con la imagen correspondiente
  };

  return (
    <ScrollView className="flex-1 bg-[#F4EDE0] px-4 py-6">
      {/* Botón de volver */}
      <TouchableOpacity onPress={() => router.back()} className="absolute top-6 left-4 z-10">
        <Text className="text-[#699D81] text-2xl">&#60;</Text>
      </TouchableOpacity>

      <Text className="text-lg font-bold mb-4 mt-10">{dia.titulo}</Text>

      <Image
        source={dia.imagen}
        resizeMode="contain"
        className="w-full h-48 bg-gray-300 rounded-md mb-4"
      />

      <Text className="text-base font-bold mb-1 text-black">Texto del día</Text>
      <Text className="text-black mb-6">{dia.descripcion}</Text>

      <TouchableOpacity
        className="bg-[#C76F40] px-4 py-3 rounded-md self-start"
        onPress={() => {}}
      >
        <Text className="text-white font-bold">Editar día</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

