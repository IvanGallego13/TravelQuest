import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons"; // Íconos decorativos
import { useEffect, useState } from "react";

// Tipo Día para simular mejor la estructura real
type Dia = {
  id: number;
  titulo: string;
  descripcion: string;
};

export default function CiudadDetalle() {
  const router = useRouter();
  const { idDiario, ciudad, imagen } = useLocalSearchParams(); // Recibimos el ID real del diario, la ciudad y la imagen.
  const [dias, setDias] = useState<Dia[]>([]);

  // Simulación de carga de días desde una "API"
  useEffect(() => {
    // En el futuro reemplaza esto por un fetch real usando idDiario
    const diasSimulados: Dia[] = [
      { id: 1, titulo: "DÍA 1", descripcion: "Santiago Bernabéu" },
      { id: 2, titulo: "DÍA 2", descripcion: "Museo del Prado" },
      { id: 3, titulo: "DÍA 3", descripcion: "Castellana" },
      { id: 4, titulo: "DÍA 4", descripcion: "Palacio Real" },
      { id: 5, titulo: "DÍA 5", descripcion: "Puerta del Sol" },
    ];
    setDias(diasSimulados);
  }, []);

  // Al tocar un día, navega a la pantalla 3dia.tsx con su ID
  const handleVerDia = (idDia: number) => {
    router.push(`/diario/3dia?idDia=${idDia}`);
  };

  return (
    <ScrollView className="flex-1 bg-[#F4EDE0] px-4 py-6">
      {/* Ciudad + imagen */}
      <View className="mb-6">
        <Text className="text-xl font-bold text-black mb-2">{ciudad}</Text>
        {imagen ? (
          <Image
            source={{ uri: imagen as string }}
            className="w-full h-40 rounded-xl"
            resizeMode="cover"
          />
        ) : (
    <View className="w-full h-40 bg-gray-300 rounded-xl items-center justify-center">
      <Text className="text-gray-700">Sin imagen de ciudad</Text>
    </View>
  )}
</View>

      {/* Lista de días */}
      {dias.map((dia) => (
        <TouchableOpacity
          key={dia.id}
          className="flex-row justify-between items-center bg-white p-4 mb-4 rounded-xl border-2 border-[#699D81]"
          onPress={() => handleVerDia(dia.id)}
        >
          {/* Info del día */}
          <View>
            <Text className="text-black font-bold">{dia.titulo}</Text>
            <Text className="text-black text-sm">{dia.descripcion}</Text>
          </View>

          {/* Íconos decorativos como en tu imagen */}
          <View className="flex-row space-x-2">
            <Ionicons name="today" size={20} color="#699D81" />
            <FontAwesome5 name="image" size={18} color="#C76F40" />
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}


