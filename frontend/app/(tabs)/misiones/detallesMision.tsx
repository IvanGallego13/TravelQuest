import { View, Text, ScrollView, Image, TouchableOpacity,Alert, ActivityIndicator, ImageBackground  } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { SafeAreaView } from "react-native-safe-area-context";


export default function DetalleMisionCompletada() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const missionId = Number(id);
  const [mission, setMission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageHeight, setImageHeight] = useState(200);

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const res = await apiFetch("/misiones/mine");
        if (!res.ok) throw new Error("No se pudieron cargar las misiones");
        const allMissions = await res.json();

        const found = allMissions.find((m: any) => m.id === missionId);
        if (!found) {
          Alert.alert("Error", "No se encontró la misión.");
          router.back();
          return;
        }
        setMission(found);

      } catch (err) {
        console.error("❌", err);
        Alert.alert("Error", "Hubo un problema al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchMission();
  }, [id]);

  useEffect(() => {
    console.log("🧠 Misión recibida:", mission);
    if (mission?.image_url) {
      Image.getSize(mission.image_url, (width, height) => {
        const ratio = height / width;
        setImageHeight(300 * ratio); // o usa screen width * ratio si prefieres
      });
    }
  }, [mission?.image_url]);

  if (loading || !mission) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F4EDE0]">
        <ActivityIndicator size="large" color="#699D81" />
        <Text className="text-black mt-4">Cargando misión...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../../assets/images/nubes.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <SafeAreaView className="flex-1">

        {/* Botón volver fijo */}
        <TouchableOpacity
          onPress={() => router.push("./listaMisiones")}
          className="absolute top-6 left-4 z-50 bg-white/90 p-2 rounded-full shadow-md"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        {/* Contenido desplazable */}
        <View className="flex-1 pt-20 px-6">
          <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
            {/* Título */}
            <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-6 flex-row items-center gap-2">
              <Text className="text-black text-lg font-bold">📌 {mission.title}</Text>
            </View>

            {/* Descripción */}
            <View className="bg-white/80 rounded-2xl shadow-md p-4 mb-6">
              <Text className="text-black text-base leading-6">{mission.description}</Text>
            </View>

            {/* Fecha */}
            <View className="bg-white/80 rounded-xl shadow-md px-4 py-3 mb-6 self-start flex-row items-center gap-2">
              <Text className="text-black text-base">✅ Completada el {new Date(mission.completed_at).toLocaleDateString("es-ES")}</Text>
            </View>

            {/* Imagen */}
            {mission.image_url ? (
              <Image
                source={{ uri: mission.image_url }}
                style={{
                  width: "100%",
                  height: imageHeight,
                  borderRadius: 16,
                  marginBottom: 24,
                }}
                resizeMode="cover"
              />
            ) : (
              <Text className="text-gray-600 italic mb-6">No se subió imagen para esta misión.</Text>
            )}

            {/* Historia */}
            {mission.status === "completed" && mission.historia && (
              <>
                <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-4 flex-row items-center gap-2">
                  <Text className="text-black text-lg font-bold">📖 Historia del lugar</Text>
                </View>

                <View className="bg-white/80 rounded-2xl p-4 shadow-md">
                  <Text className="text-black leading-6 text-justify">{mission.historia}</Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>

      </SafeAreaView>
    </ImageBackground>
  );
}
