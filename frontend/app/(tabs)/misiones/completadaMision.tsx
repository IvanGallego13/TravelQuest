import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MisionCompletada() {
  const router = useRouter();
  const { missionId } = useLocalSearchParams();

  const handleVerHistoria = () => {
    router.push({
      pathname: "/misiones/historiaMision",
      params: { missionId: missionId?.toString() },
    });
  };

  const handleExplorar = () => {
    router.replace("/(tabs)/crear");
  };

  return (
    <View className="flex-1 bg-[#F4EDE0] justify-center items-center px-6">
      <Ionicons name="checkmark-circle-outline" size={64} color="#699D81" />
      <Text className="text-2xl font-bold text-black mt-4 mb-2 text-center">
        ¡Misión completada!
      </Text>
      <Text className="text-base text-black text-center mb-6">
        Has completado con éxito tu misión. ¿Quieres saber más sobre lo que fotografiaste?
      </Text>

      <TouchableOpacity
        onPress={handleVerHistoria}
        className="bg-[#699D81] px-6 py-3 rounded-full mb-4"
      >
        <Text className="text-white font-semibold text-base">Ver historia</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleExplorar}
        className="bg-[#C76F40] px-6 py-3 rounded-full"
      >
        <Text className="text-white font-semibold text-base">Seguir explorando</Text>
      </TouchableOpacity>
    </View>
  );
}
