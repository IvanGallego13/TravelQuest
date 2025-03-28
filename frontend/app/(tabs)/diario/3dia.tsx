import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function DiaDetalle() {
  const router = useRouter();
  const { idDia } = useLocalSearchParams();

  // Simulación de los datos de un día (luego se reemplaza por datos reales desde backend)
  const dia = {
    id: idDia,
    titulo: "Día Seleccionado",
    descripcion: "Descripción que hace el usuario de su día.",
    imagen: require("@/assets/images/icon.png"),
  };

  return (
    <View className="flex-1 bg-[#F4EDE0] relative">
      {/* DECORACIÓN DE FONDO */}

      {/* Brújula arriba derecha */}
      <Image
        source={require("@/assets/images/brujula.png")}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          width: 60,
          height: 60,
          opacity: 0.2,
          transform: [{ rotate: "-15deg" }],
        }}
      />

      {/* Maleta abajo derecha */}
      <Image
        source={require("@/assets/images/maleta.png")}
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          width: 70,
          height: 70,
          opacity: 0.2,
        }}
      />

      {/* CONTENIDO PRINCIPAL */}
      <ScrollView contentContainerStyle={{ padding: 24 }}>

        {/* Botón volver */}
        <TouchableOpacity onPress={() => router.back()} className="mb-4 self-start">
          <Ionicons name="arrow-back" size={28} color="#699D81" />
        </TouchableOpacity>

        {/* Título del día */}
        <Text className="text-lg font-bold text-black mb-4">{dia.titulo}</Text>

        {/* Imagen del día */}
        <Image
          source={dia.imagen}
          resizeMode="cover"
          className="w-full h-48 rounded-xl mb-4 bg-gray-300"
        />

        {/* Descripción del día */}
        <Text className="text-base font-bold mb-1 text-black">Texto del día</Text>
        <Text className="text-black mb-6">{dia.descripcion}</Text>

        {/* Botón para editar */}
        <TouchableOpacity
          className="bg-[#C76F40] px-4 py-3 rounded-xl self-start"
          onPress={() =>
            router.push({
              pathname: "/crear/2.2entradaDiario",
              params: { idDia: dia.id }, // <- pasamos el id del día actual
            })
          }
        >
          <Text className="text-white font-bold">Editar día</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

