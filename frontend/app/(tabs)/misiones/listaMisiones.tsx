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
            className="bg-white/80 p-4 rounded-2xl shadow-md flex-row items-center space-x-4"
          >
            <View className="flex-1 pr-2">
              <Text className="text-black font-bold text-base mb-1">{mission.title}</Text>
              <Text className="text-black text-sm mb-1" numberOfLines={2}>
                {mission.description}
              </Text>
              <View className="flex-row items-center space-x-2">
                <Text className="text-xs text-gray-500 italic me-3">{dateText}</Text>
                  <Text>{isCompleted ? "✅" : "🕒"}</Text>
              </View>
            </View>
  
            {isCompleted && mission.image_url && (
              <Image
                source={{ uri: mission.image_url }}
                style={{ width: 60, height: 60, borderRadius: 10 }}
              />
            )}
          </TouchableOpacity>
        </MotiView>
      );
    };
  
    return (
      <ImageBackground
        source={require("../../../assets/images/catedral.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <View className="flex-1 bg-white/20 px-4 pt-20">
          <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            {pending.length > 0 && (
              <View className="mb-8">
                <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-4 flex-row items-center gap-2">
                  <Text className="text-black text-lg font-bold">🕒 Misiones pendientes</Text>
                </View>
                {pending.map((m, i) => renderMission(m, i))}
              </View>
            )}
  
            {completed.length > 0 && (
              <View>
                <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-4 flex-row items-center gap-2">
                  <Text className="text-black text-lg font-bold">✅ Misiones completadas</Text>
                </View>
                {completed.map((m, i) => renderMission(m, i))}
              </View>
            )}
          </ScrollView>
        </View>
      </ImageBackground>
    );
  }