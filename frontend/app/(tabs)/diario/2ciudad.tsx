import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function CiudadDetalle() {
  const router = useRouter();
  const { ciudad } = useLocalSearchParams();

  // Simulación de días del viaje (en una app real, se recuperaría desde la base de datos)
  const dias = [
    { id: 1, titulo: "Día 1", descripcion: "Explorando el casco antiguo" },
    { id: 2, titulo: "Día 2", descripcion: "Visita a museos y galerías" },
    { id: 3, titulo: "Día 3", descripcion: "Relax en la playa" },
  ];

  const handleVerDia = (idDia: number) => {
    router.push(`/diario/3dia?id=${idDia}`);
  };

  return (
    <ScrollView className="flex-1 bg-[#F4EDE0] px-4 py-6">
      <Text className="text-lg font-bold mb-4">{ciudad}</Text>
      <Text className="text-base font-semibold mb-4">Días del viaje</Text>

      {dias.map((dia) => (
        <TouchableOpacity
          key={dia.id}
          className="bg-white p-4 mb-4 rounded-md border border-[#699D81]"
          onPress={() => handleVerDia(dia.id)}
        >
          <Text className="text-black font-bold">{dia.titulo}</Text>
          <Text className="text-black">{dia.descripcion}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

