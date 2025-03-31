import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

// Tipo de diario (puedes ampliarlo luego)
type Diario = {
  id: string;
  ciudad: string;
  descripcion: string;
  fecha: string; // formato "YYYY-MM-DD"
  imagen?:string;
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
          { id: "1", ciudad: "Madrid", descripcion: "Santiago Bernabéu", fecha: "2025-03-20", imagen: "https://placekitten.com/300/200", },
          { id: "2", ciudad: "Barcelona", descripcion: "La Sagrada Familia", fecha: "2025-02-14", imagen: "https://placekitten.com/300/200", },
          { id: "3", ciudad: "Alicante", descripcion: "Puerto Alicante", fecha: "2025-01-05", imagen: "https://placekitten.com/300/200", },
          { id: "4", ciudad: "Valencia", descripcion: "UPV", fecha: "2024-12-22", imagen: "https://placekitten.com/300/200", },
          { id: "5", ciudad: "Murcia", descripcion: "Reu", fecha: "2024-11-18", imagen: "https://placekitten.com/300/200", },
        ];
        setDiarios(datosFalsos);
        setLoading(false);
      }, 1000);
    };

    cargarDiariosSimulados();
  }, []);

  // Navegación al detalle del diario de una ciudad
  const irADetalleCiudad = (id: string, ciudad: string, imagen?: string) => {
    router.push({
      pathname: "../diario/2ciudad",
      params: {
        idDiario: id,
        ciudad,
        imagen: imagen ?? "",
      },
    });
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
            onPress={() => irADetalleCiudad(diario.id, diario.ciudad, diario.imagen)}
            className="bg-white mb-4 p-3 rounded-xl border-2 border-[#699D81]"
          >
            <View className="flex-row space-x-4 items-center">
              {/* Imagen si existe */}
              {diario.imagen ? (
                <Image
                  source={{ uri: diario.imagen }}
                  className="w-20 h-20 rounded-md"
                  resizeMode="cover"
                />
              ) : (
                <View className="w-20 h-20 bg-gray-300 rounded-md items-center justify-center">
                  <Text className="text-xs text-gray-500 text-center">Sin imagen</Text>
                </View>
              )}

              {/*Info del diario */}
              <View className="flex-1">
                <Text className="text-black font-bold text-base">{diario.ciudad}</Text>
                <Text className="text-black text-sm">{diario.descripcion}</Text>
                <Text className="text-gray-600 text-xs">{diario.fecha}</Text>
              </View>

              {/* Íconos decorativos */}
              <View className="flex-col items-end space-y-2">
                <Ionicons name="location-sharp" size={20} color="#699D81" />
                <FontAwesome5 name="book" size={18} color="#C76F40" />
              </View>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

