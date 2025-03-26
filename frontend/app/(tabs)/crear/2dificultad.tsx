import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";

export default function Dificultad() {
  const router = useRouter();

  const seleccionarDificultad = (nivel: "fácil" | "media" | "difícil") => {
    // Aquí puedes guardar en Zustand o pasar por parámetros la dificultad
    // o hacer un fetch al backend para generar misión si ya está implementado
    console.log("Dificultad seleccionada:", nivel);

    // Simulación de navegación al generar misión
    router.push({
      pathname: "./3misionGenerada",
      params: { dificultad: nivel },
    });
  };

  return (
    <View className="flex-1 bg-[#F4EDE0] px-6 pt-10 justify-start">
      
      <Text className="text-xl font-bold text-black border-b border-gray-400 mb-10">Nivel de dificultad</Text>

      <View>
        <TouchableOpacity
          className="bg-[#C76F40] py-4 rounded-xl items-center mb-5"
          onPress={() => seleccionarDificultad("fácil")}
        >
          <Text className="text-white font-semibold text-base">Fácil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#699D81] py-4 rounded-xl items-center mb-5"
          onPress={() => seleccionarDificultad("media")}
        >
          <Text className="text-white font-semibold text-base">Media</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#C76F40] py-4 rounded-xl items-center"
          onPress={() => seleccionarDificultad("difícil")}
        >
          <Text className="text-white font-semibold text-base">Difícil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
