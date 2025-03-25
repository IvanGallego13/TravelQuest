import { Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function OpcionesDeCrear() {
  const router = useRouter();
  const irASeleccionDificultad = ()=>{
    router.push("./crear/2dificultad");
  };
  const irAEditarDiario =()=>{
    router.push("./crear/2.2entradaDiario");
  };

  return (
    <View className="flex-1 justify-center items-cente space-y-6 px-6"style={{ backgroundColor: "#F4EDE0" }}>
      <Text className="text-2xl font-bold text-black mb-4">¿Qué quieres crear?</Text>

      <TouchableOpacity
        className="px-6 py-4 rounded-xl w-full items-center"
        onPress={irASeleccionDificultad}
        style={{ backgroundColor: "#699D81" }}>
        <Text className="text-white text-lg font-semibold">Crear Misión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="px-6 py-4 rounded-xl w-full items-center"
        onPress={irAEditarDiario}
        style={{ backgroundColor: "#C76F40" }}>
        <Text className="text-white text-lg font-semibold">Crear Entrada del Diario</Text>
      </TouchableOpacity>
    </View>
  );
}
