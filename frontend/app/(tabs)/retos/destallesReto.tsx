// app/grupo/completarMision.tsx
import { useState, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ImageBackground, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useAuthStore } from "../../../store/auth";
import { apiFetch } from "../../../lib/api";

export default function CompletarMisionGrupo() {
  const { challengeId, missionId, title, description, difficulty, estado, user_id } = useLocalSearchParams();
  const { userId } = useAuthStore();
  const router = useRouter();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isMine = user_id === userId;
  const isFree = estado === "available";
  const isAssignedToAnother = estado === "assigned" && !isMine;

  const tomarFoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permiso denegado");
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const subirFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const asignarMision = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/group-challenges/${challengeId}/missions/${missionId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "assigned" }),
      });
      if (!res.ok) throw new Error("No se pudo asignar la misión");
      Alert.alert("✅ Misión asignada");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error al asignar la misión");
    } finally {
      setLoading(false);
    }
  };

  const dejarMision = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/group-challenges/${challengeId}/missions/${missionId}/unassign`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("No se pudo dejar la misión");
      Alert.alert("🚫 Misión liberada");
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error al dejar la misión");
    } finally {
      setLoading(false);
    }
  };

  const enviarMision = async () => {
    if (!imageUri) return Alert.alert("Sube o toma una foto antes");

    try {
      const res = await apiFetch(`/misiones/${missionId}/validate-image`, {
        method: "POST",
        body: JSON.stringify({ image_url: imageUri }),
      });
      if (!res.ok) {
        const err = await res.json();
        return Alert.alert("❌ Imagen no válida", err.message || "Intenta otra foto.");
      }

      const patchRes = await apiFetch(`/group-challenges/${challengeId}/missions/${missionId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "completed" }),
      });
      if (!patchRes.ok) throw new Error("No se pudo completar la misión");

      Alert.alert("✅ Misión completada");
      router.replace("./retos/detallesReto");
    } catch (err) {
      console.error(err);
      Alert.alert("Error al enviar la misión");
    }
  };

  return (
    <ImageBackground source={require("../../../assets/images/fondo.png")} style={{ flex: 1 }} resizeMode="cover">
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
        <TouchableOpacity onPress={() => router.back()} className="absolute top-10 left-4 bg-white/70 p-2 rounded-full z-10">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <View className="bg-white/80 p-4 rounded-2xl shadow-md mb-4">
          <Text className="text-black text-xl font-bold text-center">🧭 {title}</Text>
        </View>

        <View className="bg-white/80 p-4 rounded-2xl shadow-md mb-6">
          <Text className="text-black text-base">{description}</Text>
        </View>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={{ width: "100%", height: 200, borderRadius: 12, marginBottom: 20 }} />
        )}

        {loading && (
          <ActivityIndicator size="large" color="#699D81" className="mb-6" />
        )}

        {/* Botones */}
        <View className="space-y-4">
          {isFree && (
            <TouchableOpacity onPress={asignarMision} className="bg-[#699D81] p-4 rounded-2xl shadow-md">
              <Text className="text-white text-lg font-bold text-center">🔓 Asignarme esta misión</Text>
            </TouchableOpacity>
          )}

          {isMine && (
            <>
              <View className="flex-row justify-between">
                <TouchableOpacity onPress={tomarFoto} className="bg-white px-4 py-3 rounded-xl shadow-md">
                  <Text className="text-black font-semibold">📷 Tomar Foto</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={subirFoto} className="bg-white px-4 py-3 rounded-xl shadow-md">
                  <Text className="text-black font-semibold">🖼️ Subir Foto</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={enviarMision} className="bg-[#4CAF50] p-4 rounded-2xl shadow-md">
                <Text className="text-white text-lg font-bold text-center">✅ Enviar Misión</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={dejarMision} className="bg-red-500 p-4 rounded-2xl shadow-md">
                <Text className="text-white text-lg font-bold text-center">🚫 Dejar misión</Text>
              </TouchableOpacity>
            </>
          )}

          {isAssignedToAnother && (
            <View className="bg-yellow-200 p-3 rounded-xl shadow">
              <Text className="text-black text-center">⛔ Ya está asignada a otro jugador</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
