import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";

// Simulación de los datos de ciudades visitadas
const viajes = [
  { ciudad: "Madrid", descripcion: "Santiago Bernabéu" },
  { ciudad: "Barcelona", descripcion: "La Sagrada Familia" },
  { ciudad: "Alicante", descripcion: "Puerto Alicante" },
  { ciudad: "Valencia", descripcion: "Universidad Politécnica Valencia" },
  { ciudad: "Murcia", descripcion: "Reu" },
];

export default function DiarioIndex() {
  const router = useRouter();

  // Simulación de navegación a la pantalla de detalles de una ciudad
  const irADetalleCiudad = (ciudad: string) => {
    router.push(`../diario/2ciudad?nombre=${encodeURIComponent(ciudad)}`);
  };

  return (
    <ScrollView className="flex-1 bg-[#F4EDE0] px-4 pt-6">
      <Text className="text-lg font-bold mb-4 border-b border-black w-fit">Ciudades</Text>

      {viajes.map((viaje, index) => (
        <TouchableOpacity
          key={index}
          className="bg-white mb-4 p-4 rounded-lg border-2 border-[#699D81]"
          onPress={() => irADetalleCiudad(viaje.ciudad)}
        >
          <Text className="text-black font-bold text-base">{viaje.ciudad}</Text>
          <Text className="text-black text-sm">{viaje.descripcion}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
