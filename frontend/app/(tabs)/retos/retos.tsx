import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ImageBackground, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { apiFetch } from "../../../lib/api";

interface Mission {
  id: number;
  title: string;
  description: string;
  difficulty: number;
  estado: "available" | "assigned" | "completed";
  user_id: string | null;
}

interface Challenge {
  id: string;
  title: string;
  created_at: string;
  is_solo: boolean;
  invite_code?: string;
}

export default function Retos() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const passedChallengeId = typeof id === "string" ? id : null;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarReto();
  }, []);

  const cargarReto = async () => {
    setLoading(true);
    try {
      let challengeData;

      if (passedChallengeId) {
        const res = await apiFetch(`/group-challenges/${passedChallengeId}`);
        const data = await res.json();
        challengeData = data.challenge;
      } else {
        const res = await apiFetch("/group-challenges/active");
        const data = await res.json();
        challengeData = data?.challenge;
      }

      if (!challengeData) {
        setChallenge(null);
        setMissions([]);
        return;
      }

      setChallenge(challengeData);

      const resMissions = await apiFetch(`/group-challenges/${challengeData.id}/missions`);
      const missionsData = await resMissions.json();
      setMissions(missionsData);
    } catch (err) {
      console.error("❌ Error al cargar reto:", err);
      Alert.alert("Error", "No se pudo cargar el reto.");
    } finally {
      setLoading(false);
    }
  };

  const eliminarReto = async () => {
    Alert.alert(
      "¿Eliminar reto?",
      "Esto borrará tu participación en el reto actual.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await apiFetch("/group-challenges/active", { method: "DELETE" });
              setChallenge(null);
              setMissions([]);
              Alert.alert("Reto eliminado", "Puedes crear uno nuevo desde la pestaña de crear.");
            } catch (err) {
              console.error("❌ Error al eliminar reto:", err);
              Alert.alert("Error", "No se pudo eliminar el reto.");
            }
          },
        },
      ]
    );
  };

  const dificultadLabel = (d: number) => {
    if (d <= 1) return "Fácil";
    if (d === 3) return "Media";
    return "Difícil";
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/fondo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        {loading ? (
          <View className="items-center justify-center mt-10">
            <ActivityIndicator size="large" color="#699D81" />
            <Text className="text-black mt-4">Cargando reto...</Text>
          </View>
        ) : challenge ? (
          <>
            <View className="bg-white/80 p-4 rounded-2xl shadow-md mb-6">
              <Text className="text-black text-xl font-bold mb-1">{challenge.title}</Text>
              <Text className="text-black text-sm mb-2">
                Iniciado: {new Date(challenge.created_at).toLocaleDateString()}
              </Text>

              {!challenge.is_solo && challenge.invite_code && (
                <TouchableOpacity
                  onPress={() =>
                    Alert.alert("Código de invitación", `🔗 ${challenge.invite_code}`)
                  }
                  className="bg-[#699D81] rounded-lg px-4 py-2 mt-2 self-start"
                >
                  <Text className="text-white font-semibold">👥 Invitar amigos al reto</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={eliminarReto}
                className="bg-red-500 rounded-lg px-4 py-2 mt-2 self-start"
              >
                <Text className="text-white font-semibold">❌ Eliminar reto</Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-4">
              {missions.map((mission) => (
                <View key={mission.id} className="bg-white/90 p-4 rounded-xl shadow-md">
                  <Text className="text-black font-bold text-base mb-1">{mission.title}</Text>
                  <Text className="text-black/70 text-sm mb-2">{mission.description}</Text>
                  <Text className="text-black/60 text-sm">
                    Dificultad: {dificultadLabel(mission.difficulty)} • Estado:{" "}
                    {mission.estado === "completed"
                      ? "✅ Completada"
                      : mission.estado === "assigned"
                      ? "🕒 Asignada"
                      : "🔓 Disponible"}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View className="bg-white/80 p-4 rounded-xl items-center justify-center">
            <Text className="text-black text-lg text-center font-semibold mb-2">
              No tienes ningún reto activo.
            </Text>
            <Text className="text-black/60 text-sm text-center">
              Crea un nuevo reto desde la pestaña de "Crear".
            </Text>
          </View>
        )}
      </ScrollView>
    </ImageBackground>
  );
}
