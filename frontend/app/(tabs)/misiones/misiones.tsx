import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

// Tipo misión
type Mision = {
  id: string;
  titulo: string;
  descripcion: string;
  completada: boolean;
  fecha: string;
};

export default function ListaMisiones() {
  const router = useRouter();
  const [misiones, setMisiones] = useState<Mision[]>([]);

  // Simulación de fetch de misiones desde backend
  useEffect(() => {
    const misionesSimuladas: Mision[] = [
      {
        id: "1",
        titulo: "Misión 1",
        descripcion: "Haz una foto del museo del prado",
        completada: true,
        fecha: "2025-03-23",
      },
      {
        id: "2",
        titulo: "Misión 2",
        descripcion: "Ir en menos de 20 min al Bernabéu",
        completada: false,
        fecha: "2025-03-22",
      },
      {
        id: "3",
        titulo: "Misión 3",
        descripcion: "___________",
        completada: false,
        fecha: "2025-03-21",
      },
    ];

    setMisiones(misionesSimuladas);
  }, []);

  // Al pulsar una misión, decidir a qué pantalla ir
  const handlePressMision = (mision: Mision) => {
    if (mision.completada) {
      router.push(`/misiones/2descripcion?id=${mision.id}`);
    } else {
      router.push({
        pathname: "/crear/3misionGenerada",
        params: { idMision: mision.id },
      });
    }
  };

  return (
    <View className="flex-1 bg-[#F4EDE0] relative">
      {/* Brújula decorativa */}
      <Image
        source={require("@/assets/images/brujula.png")}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 60,
          height: 60,
          opacity: 0.2,
          transform: [{ rotate: "-10deg" }],
        }}
      />

      <ScrollView className="px-4 pt-10">
        <Text className="text-lg font-bold text-black mb-4">
          Historial de Misiones
        </Text>

        {misiones.map((mision) => (
          <TouchableOpacity
            key={mision.id}
            onPress={() => handlePressMision(mision)}
            className={`flex-row justify-between items-center bg-white mb-4 p-4 rounded-xl border-2 ${
              mision.completada ? "border-[#699D81]" : "border-[#C76F40]"
            }`}
          >
            <View>
              <Text className="text-black font-bold text-base">{mision.titulo}</Text>
              <Text className="text-black text-sm">{mision.descripcion}</Text>
            </View>

            <View className="flex-row space-x-2">
              <Ionicons name="checkmark-done" size={20} color={mision.completada ? "#699D81" : "#C76F40"} />
              <FontAwesome5 name="map-marked-alt" size={18} color="#C76F40" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
