import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../lib/api";
import * as SecureStore from "expo-secure-store";

// Definir tipos para logros y misiones
interface Logro {
  achievement_id: string;
  unlocked_at: string;
  puntos: number;
}

interface Mision {
  mission_id: string;
  status: string;
  completed_at: string;
  image_url: string;
  difficulty?: number;
}

export default function Usuario() {
  const router = useRouter();
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const { logout } = useAuth();
  
  // Estados para datos del usuario
  const [username, setUsername] = useState("Usuario");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [logros, setLogros] = useState<Logro[]>([]);
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [totalLogrosPuntos, setTotalLogrosPuntos] = useState(0);
  const [totalMisionesPuntos, setTotalMisionesPuntos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      
      // Cargar perfil completo del usuario usando la nueva ruta
      const perfilRes = await apiFetch("/users/profile/complete");
      
      if (!perfilRes.ok) throw new Error("Error al cargar perfil");
      const perfilData = await perfilRes.json();
      
      // Establecer nombre de usuario
      if (perfilData.profile && perfilData.profile.username) {
        setUsername(perfilData.profile.username);
      } else {
        setUsername("Usuario");
      }
      
      // Establecer avatar
      if (perfilData.profile && perfilData.profile.avatar_url) {
        setAvatarUrl(perfilData.profile.avatar_url);
      }
      
      // Establecer logros
      if (perfilData.achievements) {
        setLogros(perfilData.achievements);
        
        // Calcular puntos de logros (10 puntos por logro)
        const puntosLogros = perfilData.achievements.length * 10;
        setTotalLogrosPuntos(puntosLogros);
      }
      
      // Establecer misiones completadas
      if (perfilData.completedMissions) {
        setMisiones(perfilData.completedMissions);
        
        // Calcular puntos de misiones (20 puntos por misión)
        const puntosMisiones = perfilData.completedMissions.length * 20;
        setTotalMisionesPuntos(puntosMisiones);
      }
      
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Alert.alert("Error", "No se pudo cargar tu perfil. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Calcular nivel basado en puntos totales (ahora el nivel es igual a los puntos)
  const calcularNivel = (puntos: number) => {
    return puntos; // El nivel es igual a los puntos totales
  };
  
  const handleVerRanking = () => {
    router.push("/usuario/2ranking");
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#F4EDE0] justify-center items-center">
        <ActivityIndicator size="large" color="#699D81" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F4EDE0] relative pt-10 px-4">
      {/* Botón de ajustes arriba a la derecha */}
      <View className="absolute top-10 right-4 z-10">
        <TouchableOpacity onPress={() => setMostrarMenu(!mostrarMenu)}>
          <Ionicons name="settings-outline" size={28} color="#699D81" />
        </TouchableOpacity>

        {/* Menú desplegable */}
        {mostrarMenu && (
          <View className="absolute top-14 right-4 bg-white rounded-xl border border-gray-300 shadow-md z-10 w-56">
            {/* Cabecera del menú */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
              <Ionicons name="settings-outline" size={20} color="#699D81" />
              <Text className="text-black font-semibold ml-2">Ajustes</Text>
            </View>

            {/* Opción: Editar perfil */}
            <TouchableOpacity
              onPress={() => {
                setMostrarMenu(false);
                router.push("/usuario/editar");
              }}
              className="flex-row items-center px-4 py-3 border-b border-gray-200"
            >
              <MaterialIcons name="edit" size={20} color="#000" />
              <Text className="text-black ml-2">Editar perfil</Text>
            </TouchableOpacity>

            {/* Opción: Cerrar sesión */}
            <TouchableOpacity
              onPress={() => {
                setMostrarMenu(false);
                logout();
              }}
              className="flex-row items-center px-4 py-3 border-b border-gray-200"
            >
              <Ionicons name="lock-closed-outline" size={20} color="#C76F40" />
              <Text className="text-[#C76F40] ml-2 font-semibold">Cerrar sesión</Text>
            </TouchableOpacity>

            {/* Opción: Sobre TravelQuest */}
            <TouchableOpacity
              onPress={() => {
                setMostrarMenu(false);
                router.push("../usuario/sobre");
              }}
              className="flex-row items-center px-4 py-3"
            >
              <Ionicons name="information-circle-outline" size={20} color="#000" />
              <Text className="text-black ml-2">Sobre TravelQuest</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView className="flex-1 bg-[#F4EDE0] px-4 pt-10">
        {/* 📸 Avatar + Nivel + Ranking */}
        <View className="items-center mb-4">
          <Image
            source={
              avatarUrl
                ? { uri: avatarUrl }
                : require("../../../assets/images/avatar.png")
            }
            className="w-24 h-24 rounded-full mb-2"
          />
          <Text className="text-black font-bold text-lg mb-2">
            {username}
          </Text>
          <Text className="text-black font-bold text-lg mb-2">
            Nivel {calcularNivel(totalLogrosPuntos + totalMisionesPuntos)}
          </Text>

          <TouchableOpacity
            onPress={handleVerRanking}
            className="bg-[#699D81] px-4 py-2 rounded-xl"
          >
            <Text className="text-white font-semibold text-sm">Ver Ranking</Text>
          </TouchableOpacity>
        </View>

        {/* 🏅 Logros */}
        <Text className="text-black font-bold text-base mb-2 border-b border-black w-fit">
          Logros ({logros.length})
        </Text>

        {logros.length > 0 ? (
          logros.map((logro, index) => (
            <View
              key={index}
              className="flex-row justify-between items-center bg-white p-3 mb-3 rounded-xl border-2 border-[#699D81]"
            >
              <View className="flex-row items-center space-x-2">
                <Ionicons name="trophy-outline" size={24} color="#C76F40" />
                <Text className="text-black font-medium">
                  {logro.achievement_id}
                </Text>
              </View>
              <Text className="text-[#699D81] font-bold">
                +10 pts
              </Text>
            </View>
          ))
        ) : (
          <Text className="text-gray-500 italic mb-4">
            No has conseguido logros aún
          </Text>
        )}

        {/* 🎯 Misiones completadas */}
        <Text className="text-black font-bold text-base mb-2 mt-4 border-b border-black w-fit">
          Misiones completadas ({misiones.filter(m => m.status === "completed").length})
        </Text>

        {misiones.filter(m => m.status === "completed").length > 0 ? (
          misiones
            .filter(m => m.status === "completed")
            .map((mision, index) => (
              <View
                key={index}
                className="flex-row justify-between items-center bg-white p-3 mb-3 rounded-xl border-2 border-[#699D81]"
              >
                <View className="flex-row items-center space-x-2">
                  <Ionicons name="checkmark-circle-outline" size={24} color="#699D81" />
                  <Text className="text-black font-medium">
                    Misión {mision.mission_id}
                  </Text>
                </View>
                <Text className="text-[#699D81] font-bold">
                  +20 pts
                </Text>
              </View>
            ))
        ) : (
          <Text className="text-gray-500 italic">
            No has completado misiones aún
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
    