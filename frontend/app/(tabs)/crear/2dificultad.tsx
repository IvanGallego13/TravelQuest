import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams} from "expo-router";
import React from 'react';
import { useAuthStore } from "@/store/auth";
import { apiFetch } from "@/lib/api";
import { useUbicacion } from "@/hooks/useUbicacion";


export default function Dificultad() {
  const router = useRouter();
  const { cityId: paramCityId } = useLocalSearchParams();
  const { ubicacion } = useUbicacion();

  const cityId = paramCityId ?? ubicacion?.cityId;
  const userId = useAuthStore((state) => state.userId);

  const dificultadNumerica = {
    facil: 1,
    media: 3,
    dificil: 5,
  };

  const seleccionarDificultad = async (nivel: "facil" | "media" | "dificil") => {
   
    if (!userId) {
      Alert.alert("Error", "Usuario no identificado.");
      return;
    }

    if (!cityId) {
      Alert.alert("Error", "Ciudad no especificada.");
      return;
    }

    try {
      console.log("Payload:", { cityId, userId, nivel});

      const res = await apiFetch("/misiones/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityId: Number(cityId),
          userId,
          difficulty: nivel.toLowerCase(),
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
      const errorMessage = err instanceof Error
      ? err.message
      : "No se pudo generar la misión.";
  
      Alert.alert("Error", errorMessage);
    }
 
  };

  return (
    <View className="flex-1 bg-[#F4EDE0] px-6 pt-10 justify-start">
      
      <Text className="text-xl font-bold text-black border-b border-gray-400 mb-10">Nivel de dificultad</Text>

      <View>
        <TouchableOpacity
          className="bg-[#C76F40] py-4 rounded-xl items-center mb-5"
          onPress={() => seleccionarDificultad("facil")}
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
          onPress={() => seleccionarDificultad("dificil")}
        >
          <Text className="text-white font-semibold text-base">Difícil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
