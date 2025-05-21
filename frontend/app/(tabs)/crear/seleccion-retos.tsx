import { View, Text, TouchableOpacity, Alert, ImageBackground, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState } from 'react';
import { useAuthStore } from "../../../store/auth";
import { apiFetch } from "../../../lib/api";

export default function SeleccionRetos() {
  const router = useRouter();
  const { mode, cityId } = useLocalSearchParams();
  const userId = useAuthStore((state) => state.userId);
  const [loading, setLoading] = useState(false);

  const iniciarReto = async (cantidad: number) => {
    if (!userId || !cityId || !mode) {
      Alert.alert("Error", "Faltan datos para iniciar el reto.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiFetch("/group-challenges/create", {
        method: "POST",
        body: JSON.stringify({
          city_id: Number(cityId),
          quantity: cantidad,
          is_solo: mode === "solo",
        }),
      });

      if (!res.ok) throw new Error("No se pudo crear o asignar el reto");
      const data = await res.json();

      const challengeId = data.challenge_id;
      router.push({
        pathname: "./retos",
        params: { id: challengeId },
      });
    } catch (err: any) {
      console.error("❌ Error al crear reto:", err);
      Alert.alert("Error", err.message || "Algo salió mal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/fondo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 px-6 pt-12 justify-start">
        <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-10 flex-row items-center gap-2">
          <Text className="text-black text-lg font-semibold">Selecciona el tamaño del reto</Text>
          <Text className="text-black text-lg">🗺️</Text>
        </View>

        <View className="bg-white/80 rounded-2xl p-4 shadow-md space-y-6 mb-10">
          {[6, 12, 20].map((num) => (
            <TouchableOpacity
              key={num}
              className="bg-white px-4 py-5 rounded-xl border border-gray-200"
              style={{
                elevation: 12,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}
              disabled={loading}
              onPress={() => iniciarReto(num)}
            >
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-black font-bold text-lg">{num} Misiones</Text>
                <Text className="text-black text-xl">→</Text>
              </View>
              <Text className="text-black/60 text-sm">
                {num === 6 ? "Explora rápido 🏃" : num === 12 ? "Aventura equilibrada 🎒" : "Reto completo 🧭"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading && (
          <View className="items-center mt-10">
            <ActivityIndicator size="large" color="#699D81" />
            <Text className="text-black mt-2">Generando reto...</Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}
