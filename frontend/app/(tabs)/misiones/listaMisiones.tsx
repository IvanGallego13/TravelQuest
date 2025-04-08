import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { apiFetch } from "@/lib/api";

// Tipo misión
type Mission = {
  id: number;
  title: string;
  description: string;
  status: "accepted" | "completed" | "discarded";
  created_at: string,
  completed_at: string | null;
};

export default function MissionList() {
  const router = useRouter();
  const [missions, setMissions] = useState<Mission[]>([]);

  // Simulación de fetch de misiones desde backend
  useEffect(() => {
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
  }, []);

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
    const dateText = isCompleted ? `Completed on ${new Date(date).toLocaleDateString()}` : `Assigned on ${new Date(date).toLocaleDateString()}`;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => handlePressMission(mission)}
        className={`bg-white mb-3 p-4 rounded-xl border-2 ${isCompleted ? "border-[#699D81]" : "border-[#C76F40]"}`}
      >
        <Text className="text-black font-bold text-base mb-1">{mission.title}</Text>
        <Text className="text-black text-sm mb-1" numberOfLines={2} ellipsizeMode="tail">
          {mission.description}
        </Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-xs text-gray-500 italic">{dateText}</Text>
          <Ionicons
            name="checkmark-done"
            size={18}
            color={isCompleted ? "#699D81" : "#C76F40"}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-[#F4EDE0] relative">
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

      <ScrollView className="px-4 pt-20 pb-10">
        {pending.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-black mb-3">Pending Missions</Text>
            {pending.map(renderMission)}
          </View>
        )}

        {completed.length > 0 && (
          <View>
            <Text className="text-lg font-bold text-black mb-3">Completed Missions</Text>
            {completed.map(renderMission)}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
