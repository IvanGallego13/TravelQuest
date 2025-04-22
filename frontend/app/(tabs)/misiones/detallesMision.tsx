import { View, Text, ScrollView, Image, TouchableOpacity,Alert, ActivityIndicator  } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";


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
    <View className="flex-1 bg-[#F4EDE0] relative">
      {/*Flecha para retroceder UNA pantalla */}
      <TouchableOpacity onPress={() => router.back()} className="absolute top-10 left-4 z-10">
        <Ionicons name="arrow-back" size={28} color="#000" />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 80 }}>
        {/* Título */}
        <Text className="text-lg font-bold text-black mb-1">{mission.title}</Text>
        <View className="h-0.5 bg-black w-2/3 mb-4" />

        {/* Descripción */}
        <Text className="text-black text-base mb-4">{mission.description}</Text>

        {/*Respuesta del usuario */}
        <View className="bg-white border-[2px] border-[#699D81] rounded-xl p-4 mb-6 shadow-sm">
          <Text className="text-black">
            {mission.completed_at
                ? `Misión completada el ${new Date(mission.completed_at).toLocaleDateString()}`
                : "Sin fecha de finalización."}
          </Text>
        </View>

        {/*Imagen subida */}
        {mission.image_url ? (
          <>
            <Text className="text-black font-semibold mb-2">Foto que subiste:</Text>
            <Image
              source={{ uri: mission.image_url }}
              style={{
                width: "100%",
                height: imageHeight,
                borderRadius: 12,
              }}
              resizeMode="cover"
            />
          </>
        ) : (
          <Text className="text-gray-500 italic">No se subió imagen para esta misión.</Text>
        )}
      </ScrollView>
    </View>
  );
}
