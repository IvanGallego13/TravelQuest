import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator,ImageBackground } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../../../lib/api";
import { Ionicons } from "@expo/vector-icons";

export default function HistoriaMision() {
  const router = useRouter();
  const { missionId } = useLocalSearchParams();
  const [historia, setHistoria] = useState<string | null>(null);
  const [titulo, setTitulo] = useState<string>("");
  const [loading, setLoading] = useState(true);

  console.log("📥 Obteniendo historia para missionId:", missionId);
  useEffect(() => {
    if (!missionId) {
      console.warn("⚠️ No se recibió missionId en los parámetros");
      return;
    }

    const fetchHistoria = async () => {
      try {
        console.log("📥 Fetching historia for missionId:", missionId);
        const res = await apiFetch(`/misiones/${missionId}/historia`);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error HTTP: ${res.status} - ${errorText}`);
        }
        const data = await res.json();
        console.log("📄 Historia obtenida:", data);

        if (typeof data.historia !== "string" || data.historia.trim().length === 0) {
          throw new Error("Historia vacía o malformada");
        }

        setHistoria(data.historia);
        if (data.title) setTitulo(data.title);
      } catch (error) {
        console.error("❌ Error obteniendo historia:", error);
        setHistoria(null);
      } finally {
        setLoading(false);
      }
    };

    if (missionId) {
      fetchHistoria();
    }else {
      console.warn("⚠️ No se recibió missionId en los parámetros");
    }
  }, [missionId]);
  return (
  <ImageBackground
    source={require('../../../assets/images/fondo.png')}
    style={{ flex: 1 }}
    resizeMode="cover"
  >
    <View className="flex-1 px-6 pt-16 justify-start">

      {/* Título */}
      <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-6">
        <Text className="text-xl font-bold text-black text-left">🧠 Píldora cultural</Text>
      </View>

      {/* Card completa: historia + botón */}
      <View
        className="bg-white/80 rounded-2xl shadow-md p-4 space-y-6"
        style={{
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        }}
      >
        {/* Contenido scrollable */}
        {loading ? (
          <View className="h-[400px] justify-center items-center">
            <ActivityIndicator size="large" color="#699D81" />
            <Text className="text-black mt-4">Cargando historia...</Text>
          </View>
        ) : historia ? (
          <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
            <Text className="text-black text-base leading-7 text-justify whitespace-pre-line">
              {historia}
            </Text>
          </ScrollView>
        ) : (
          <Text className="text-black italic text-center">
            No se pudo mostrar la historia para esta misión.
          </Text>
        )}

        {/* Botón dentro de la card */}
        <TouchableOpacity
          className="bg-white px-6 py-4 mt-5 rounded-2xl border border-gray-200 flex-row items-center justify-center"
          onPress={() => router.replace("/(tabs)/crear")}
          style={{
            elevation: 6,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          }}
        >
          <Text className="text-black font-bold text-lg">🌍 Seguir explorando</Text>
        </TouchableOpacity>
      </View>
    </View>
  </ImageBackground>
);

}
