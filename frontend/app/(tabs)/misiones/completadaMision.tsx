import { View, Text, TouchableOpacity, Image, ImageBackground } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MisionCompletada() {
  const router = useRouter();
  const { missionId, difficulty} = useLocalSearchParams();
  console.log("📦 Difficulty recibida:", difficulty);

  const puntosPorDificultad: Record<number, number> =  {
    1: 10,
    3: 20,
    5: 30,
  };
  
  const dificultadNumerica = typeof difficulty === "string" ? parseInt(difficulty, 10) : difficulty;
  const puntosGanados = puntosPorDificultad[dificultadNumerica as number] ?? 0;

  const handleVerHistoria = () => {
    console.log("📦 Enviando missionId a historia:", missionId);
    if (!missionId) {
      console.warn("⚠️ No se encontró missionId al navegar");
      return;
    }
    router.push({
      pathname: "/misiones/historiaMision",
      params: { missionId: missionId?.toString() },
    });
  };

  const handleExplorar = () => {
    router.replace("/(tabs)/crear");
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/fondo.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 bg-white/20 justify-center items-center px-6">

        {/* Icono de éxito */}
        <Ionicons name="checkmark-circle" size={80} color="#699D81" />

        {/* Mensaje principal + puntos ganados con fondo blanco semitransparente */}
        <View className="bg-white/80 px-6 py-4 rounded-xl shadow-md mb-6">
          <Text className="text-3xl font-bold text-black text-center mb-2">
            ¡Misión completada!
          </Text>
          <Text className="text-lg text-black text-center">
            Esta misión te suma <Text className="font-bold">{puntosGanados}</Text> puntos de nivel 🎉
          </Text>
        {/* Pregunta */}
          <Text className="text-lg text-black text-center mb-8">
            ¿Quieres saber más sobre lo que fotografiaste?
          </Text>
        </View>

        {/* Botones de acción */}
        <View className="flex-col space-y-6 w-full">

          <TouchableOpacity
            onPress={handleVerHistoria}
            className="bg-white/90 px-6 py-4 rounded-2xl shadow-md flex-row items-center justify-between mb-3"
          >
            <Text className="text-black font-bold text-lg">🎯 Ver historia</Text>
            <Text className="text-black text-xl">→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleExplorar}
            className="bg-white/90 px-6 py-4 rounded-2xl shadow-md flex-row items-center justify-between"
          >
            <Text className="text-black font-bold text-lg">🌍 Seguir explorando</Text>
            <Text className="text-black text-xl">→</Text>
          </TouchableOpacity>

        </View>

      </View>
    </ImageBackground>
  );
}
