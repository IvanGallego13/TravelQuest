import { View, Text, Image, FlatList, ScrollView } from "react-native";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

// Simulación de usuario actual (estos datos vendrán del backend luego)
const usuarioActual = {
  nombre: "Tú",
  nivel: 615,
  posicion: 34,
  avatar: require("@/assets/images/avatar.png"),
};

// Simulación temporal de ranking global (20 usuarios)
const usuariosTopSimulado = Array.from({ length: 20 }, (_, index) => ({
  id: `${index + 1}`,
  nombre: `Usuario ${index + 1}`,
  nivel: 900 - index * 10,
  avatar: require("@/assets/images/avatar.png"),
}));

export default function Ranking() {
  // Aquí luego puedes usar useEffect y fetch para obtener los datos reales
  const [usuariosTop, setUsuariosTop] = useState(usuariosTopSimulado);

  /*useEffect(() => {
  const fetchRanking = async () => {
    const res = await fetch("https://tu-api.com/api/ranking");
    const data = await res.json();
    setUsuariosTop(data); // ¡Automáticamente todo se actualiza!
  };

  fetchRanking();
}, []);
 */

  return (
    <View className="flex-1 bg-[#F4EDE0] px-4 pt-10">
      {/*Avatar y Nivel del usuario actual (parte superior) */}
      <View className="items-center mb-6">
        <Image source={usuarioActual.avatar} className="w-20 h-20 rounded-full mb-2" />
        <Text className="text-black font-bold text-base">Nivel {usuarioActual.nivel}</Text>
      </View>

      {/* Título */}
      <Text className="text-black font-bold text-lg mb-4">Ranking Global</Text>

      {/*Lista del ranking scrollable */}
      <FlatList
        data={usuariosTop}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        className="mb-6"
        renderItem={({ item, index }) => (
          <View
            className="flex-row items-center justify-between bg-white px-3 py-1 h-12 mb-2 rounded-md border border-[#699D81]"
          >
            <View className="flex-row items-center space-x-2">
              <Text className="text-black font-bold text-xs w-5 text-center">{index + 1}</Text>
              <Image source={item.avatar} style={{ width: 20, height: 20, borderRadius: 999 }}/>
              <Text className="text-black text-sm">{item.nombre}</Text>
            </View>
            <Text className="text-[#C76F40] font-semibold text-sm">
              Nivel {item.nivel}
            </Text>
          </View>
        )}
      />

      {/* Posición del usuario actual (si no está en el top) */}
      <Text className="text-black font-bold text-base mb-2">Tu posición</Text>
      <View className="flex-row items-center justify-between bg-white px-3 py-1 h-12 mb-10 rounded-md border border-[#699D81]">
        <View className="flex-row items-center space-x-2">
          <Text className="text-black font-bold text-xs w-5 text-center">
            {usuarioActual.posicion}
          </Text>
          <Image source={usuarioActual.avatar} style={{ width: 20, height: 20, borderRadius: 999 }} />
          <Text className="text-black text-sm">{usuarioActual.nombre}</Text>
        </View>
        <Text className="text-[#699D81] font-semibold text-sm">
          Nivel {usuarioActual.nivel}
        </Text>
      </View>
    </View>
  );
}


