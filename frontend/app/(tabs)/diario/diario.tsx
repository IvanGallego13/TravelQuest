import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

// Tipo de diario (puedes ampliarlo luego)
type Diario = {
  id: string;
  ciudad: string;
  descripcion: string;
  fecha: string; // formato "YYYY-MM-DD"
};

export default function DiarioIndex() {
  const router = useRouter();

  // Estado local para los diarios cargados
  const [diarios, setDiarios] = useState<Diario[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulación de carga de diarios desde backend
  useEffect(() => {
    // Simula un fetch a la API (puedes cambiar esto por fetch real más adelante)
    const cargarDiariosSimulados = async () => {
      setLoading(true);
      setTimeout(() => {
        const datosFalsos: Diario[] = [
          { id: "1", ciudad: "Madrid", descripcion: "Santiago Bernabéu", fecha: "2025-03-20" },
          { id: "2", ciudad: "Barcelona", descripcion: "La Sagrada Familia", fecha: "2025-02-14" },
          { id: "3", ciudad: "Alicante", descripcion: "Puerto Alicante", fecha: "2025-01-05" },
          { id: "4", ciudad: "Valencia", descripcion: "UPV", fecha: "2024-12-22" },
          { id: "5", ciudad: "Murcia", descripcion: "Reu", fecha: "2024-11-18" },
        ];
        setDiarios(datosFalsos);
        setLoading(false);
      }, 1000);
    };

    cargarDiariosSimulados();
  }, []);

  // Navegación al detalle del diario de una ciudad
  const irADetalleCiudad = (id: string) => {
    router.push(`../diario/2ciudad?idDiario=${id}`);
  };

  return (
    <ScrollView className="flex-1 bg-[#F4EDE0] px-4 pt-8">
      <Text className="text-black text-lg font-bold mb-4 border-b border-black w-fit">
        Ciudades
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#699D81" />
      ) : (
        diarios.map((diario) => (
          <TouchableOpacity
            key={diario.id}
            onPress={() => irADetalleCiudad(diario.id)}
            className="flex-row justify-between items-center bg-white mb-4 p-4 rounded-xl border-2 border-[#699D81]"
          >
            <View>
              <Text className="text-black font-bold text-base">{diario.ciudad}</Text>
              <Text className="text-black text-sm">{diario.descripcion}</Text>
              <Text className="text-gray-600 text-xs">{diario.fecha}</Text>
            </View>

            <View className="flex-row space-x-2">
              <Ionicons name="location-sharp" size={20} color="#699D81" />
              <FontAwesome5 name="book" size={18} color="#C76F40" />
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

