import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams} from "expo-router";
import React from 'react';
import { useAuthStore } from "@/store/auth";
import { apiFetch } from "@/lib/api";


export default function Dificultad() {
  const router = useRouter();
  const { cityId } = useLocalSearchParams();
  const userId = useAuthStore((state) => state.userId);

  const dificultadNumerica = {
    fácil: 1,
    media: 3,
    difícil: 5,
  };

  const seleccionarDificultad = async (nivel: "fácil" | "media" | "difícil") => {
   
    if (!userId) {
      Alert.alert("Error", "Usuario no identificado.");
      return;
    }

    if (!cityId) {
      Alert.alert("Error", "Ciudad no especificada.");
      return;
    }

    const dificultad = dificultadNumerica[nivel];

    try {
      const res = await apiFetch("/api/missions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityId: Number(cityId),
          userId,
          difficulty: dificultad,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      const mission = await res.json();

      // Navegar a misión generada
      router.push({
        pathname: "./3misionGenerada",
        params: {
          missionId: mission.id.toString(),
          title: mission.title,
          description: mission.description,
        },
      });
    } catch (err) {
      console.error("Error generando misión:", err);
      Alert.alert("Error", "No se pudo generar la misión.");
    }
 
  };

  return (
    <View className="flex-1 bg-[#F4EDE0] px-6 pt-10 justify-start">
      
      <Text className="text-xl font-bold text-black border-b border-gray-400 mb-10">Nivel de dificultad</Text>

      <View>
        <TouchableOpacity
          className="bg-[#C76F40] py-4 rounded-xl items-center mb-5"
          onPress={() => seleccionarDificultad("fácil")}
        >
          <Text className="text-white font-semibold text-base">Fácil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#699D81] py-4 rounded-xl items-center mb-5"
          onPress={() => seleccionarDificultad("media")}
        >
          <Text className="text-white font-semibold text-base">Media</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#C76F40] py-4 rounded-xl items-center"
          onPress={() => seleccionarDificultad("difícil")}
        >
          <Text className="text-white font-semibold text-base">Difícil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
