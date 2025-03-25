import { Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function GenerarMision() {
  const router = useRouter();

  const goToMisionGenerada = ()=>{
    router.push("/crear/3misionGenerada");
  };

   return (
    <View className="flex-1 items-center justify-center space-y-4">
      <Text className="text-xl font-bold mb-4">Selecciona una dificultad</Text>
      <TouchableOpacity
        className="px-6 py-4 rounded-xl w-full items-center"
        onPress={() => goToMisionGenerada()}
        style={{ backgroundColor: "#699D81" }}>
        <Text className="text-white text-lg font-semibold">Fácil</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="px-6 py-4 rounded-xl w-full items-center"
        onPress={() => goToMisionGenerada()}
        style={{ backgroundColor: "#C76F40" }}>
        <Text className="text-white text-lg font-semibold">Media</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="px-6 py-4 rounded-xl w-full items-center"
        onPress={() => goToMisionGenerada()}
        style={{ backgroundColor: "#C76F40" }}>
        <Text className="text-white text-lg font-semibold">Difícil</Text>
      </TouchableOpacity>
    </View>
    
  );
}