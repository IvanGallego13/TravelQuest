import { useRouter } from "expo-router";
import { useCallback, useState} from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ImageBackground } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { apiFetch } from "../../../lib/api";
import { useFocusEffect } from "@react-navigation/native";
import { MotiView } from "moti";


// Tipo misión
type Mission = {
  id: number;
  title: string;
  description: string;
  status: "accepted" | "completed" | "discarded";
  created_at: string,
  completed_at: string | null;
  image_url?: string | null;
};

export default function MissionList() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);

  useFocusEffect(
    useCallback(() => {
    const fetchMissions = async () => {
      try {
        const res = await apiFetch("/misiones/mine");
        if (!res.ok) throw new Error("Error al cargar misiones");
        const data = await res.json();
        setMissions(data);
      } catch (err) {
        console.error("❌", err);
        Alert.alert("Error", "No se pudieron cargar las misiones");
      }
    };

    fetchMissions();
   }, [])
  );

  // Al pulsar una misión, decidir a qué pantalla ir
  const handlePressMission = (mission: Mission) => {
    if (mission.status === "completed") {
      router.push({
        pathname: "/misiones/detallesMision",
        params: { id: mission.id.toString() },
      });
    } else {
      router.push({
        pathname: "/crear/3misionGenerada",
        params: { 
          missionId: mission.id.toString(),
          title: mission.title,
          description: mission.description,
         },
      });
    }
  };
  const pending = missions.filter(m => m.status === "accepted")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const completed = missions.filter(m => m.status === "completed")
    .sort((a, b) => new Date(b.completed_at ?? '').getTime() - new Date(a.completed_at ?? '').getTime());

  const renderMission = (mission: Mission, index: number) => {
    const isCompleted = mission.status === "completed";
    const date = isCompleted ? mission.completed_at ?? mission.created_at : mission.created_at;
    const dateText = isCompleted 
      ? `Completada el ${new Date(date).toLocaleDateString()}` 
      : `Asignada el ${new Date(date).toLocaleDateString()}`;

   return (
      <MotiView
        key={mission.id}
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ delay: index * 100, type: "timing" }}
        className="mb-4"
      >
        <TouchableOpacity
          onPress={() => handlePressMission(mission)}
          className={`p-3 rounded-xl ${isCompleted ? "bg-white/90" : "bg-gray-100/70"} shadow-sm`}
        >
          <View className="flex-row justify-between">
            <View className="flex-1 pr-3">
              <Text className={`font-bold text-base ${isCompleted ? "text-black" : "text-gray-400"}`}>
                {mission.title}
              </Text>
              <Text className={isCompleted ? "text-black" : "text-gray-400"} numberOfLines={1}>
                {mission.description}
              </Text>
              <Text className="text-xs text-gray-500 mt-1 italic">{dateText}</Text>

              <View className="mt-2 flex-row items-center">
                <Text className={`text-xs mr-1 ${isCompleted ? "text-[#699D81]" : "text-gray-400"}`}>
                  {isCompleted ? "Completado" : "Por hacer"}
                </Text>
                <Ionicons
                  name={isCompleted ? "checkmark-circle" : "time-outline"}
                  size={14}
                  color={isCompleted ? "#699D81" : "#999"}
                />
              </View>
            </View>

            {isCompleted && mission.image_url && (
              <Image
                source={{ uri: mission.image_url }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 10,
                  marginLeft: 4,
                }}
              />
            )}
          </View>
        </TouchableOpacity>
      </MotiView>
    );
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/fondo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
      >
      <TouchableOpacity
        onPress={() => router.push("/login/localizacion")}
        className="absolute top-6 left-4 z-10 bg-white/70 rounded-full p-2 shadow-md"
        >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <View className="flex-1 px-4 pt-20">
        <ScrollView contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
          {/* Tarjeta misiones pendientes */}
          {pending.length > 0 && (
            <View className="mb-8 bg-white/80 p-4 rounded-2xl shadow-md">
              <Text className="text-black font-bold text-base mb-4">
                🕒 Misiones pendientes ({pending.length})
              </Text>
              {pending.map((m, i) => renderMission(m, i))}
            </View>
          )}

          {/* Tarjeta misiones completadas */}
          {completed.length > 0 && (
            <View className="bg-white/80 p-4 rounded-2xl shadow-md">
              <Text className="text-black font-bold text-base mb-4">
                ✅ Misiones completadas ({completed.length})
              </Text>
              {completed.map((m, i) => renderMission(m, i))}
            </View>
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}