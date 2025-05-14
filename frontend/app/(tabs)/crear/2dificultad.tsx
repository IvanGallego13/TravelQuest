import { View, Text, TouchableOpacity, Alert, ImageBackground } from "react-native";
import { useRouter, useLocalSearchParams} from "expo-router";
import React from 'react';
import { useAuthStore } from "../../../store/auth";
import { apiFetch } from "../../../lib/api";
import { useUbicacion } from "../../../hooks/useUbicacion";


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
          difficulty: mission.difficulty,
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
    <ImageBackground
      source={require('../../../assets/images/fondo.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Capa blanca translúcida */}
      <View className="flex-1 bg-white/20 px-6 pt-12 justify-start">

        {/* Título */}
        <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-10 flex-row items-center gap-2">
          <Text className="text-black text-lg font-semibold">
            Nivel de dificultad
          </Text>
          <Text className="text-black text-lg">🎯</Text> 
        </View>

        {/* Opciones de dificultad */}
        <View className="flex-col space-y-6 mt-15">
          <TouchableOpacity
            className="bg-white/80 px-6 py-6 rounded-2xl shadow-md mb-20"
            onPress={() => seleccionarDificultad('facil')}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-black font-bold text-lg">Fácil</Text>
              <Text className="text-black text-xl">→</Text>
            </View>
            <Text className="text-black/60 text-sm">Gana 10 puntos 🔥</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white/80 px-6 py-6 rounded-2xl shadow-md mb-20"
            onPress={() => seleccionarDificultad('media')}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-black font-bold text-lg">Media</Text>
              <Text className="text-black text-xl">→</Text>
            </View>
            <Text className="text-black/60 text-sm">Gana 20 puntos 🔥🔥</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white/80 px-6 py-6 rounded-2xl shadow-md"
            onPress={() => seleccionarDificultad('dificil')}
          >
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-black font-bold text-lg">Difícil</Text>
              <Text className="text-black text-xl">→</Text>
            </View>
            <Text className="text-black/60 text-sm">Gana 30 puntos 🔥🔥🔥</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}