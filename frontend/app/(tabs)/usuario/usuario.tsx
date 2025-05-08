import { useEffect } from "react";
import { apiFetch } from "../../../lib/api";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, ScrollView, Image, TouchableOpacity, ImageBackground } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import React from "react";

// Define types for our data
type Logro = {
  id: string;
  nombre: string;
  descripcion: string;
  puntos: number;
  categoria: string;
  icono: string;
};

type Mision = {
  id: number;
  title: string;
  difficulty: number;
  status: string;
};

export default function Usuario() {
  const [logros, setLogros] = useState<Logro[]>([]);
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [totalLogrosPuntos, setTotalLogrosPuntos] = useState(0);
  const [totalMisionesPuntos, setTotalMisionesPuntos] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [mostrarMenu, setMostrarMenu] = useState(false);
  
  const router = useRouter();
  const { logout } = useAuth();
  
  // Calculate total level (logros points + misiones points)
  const nivel = totalLogrosPuntos + totalMisionesPuntos;

  // Update the relevant part of your usuario.tsx file
  useFocusEffect(
    React.useCallback(() => {
      const cargarDatos = async () => {
        try {
          setLoading(true);
          
          // Load user profile - No need to manually add the token
          const perfilRes = await apiFetch("/ajustes/perfil");
          
          if (!perfilRes.ok) throw new Error("Error al cargar perfil");
          const perfilData = await perfilRes.json();
          
          // Use the username from profile data structure
          // Check both profile.username and profile directly
          if (perfilData.profile && perfilData.profile.username) {
            setUsername(perfilData.profile.username);
          } else if (perfilData.username) {
            setUsername(perfilData.username);
          } else if (perfilData.email) {
            setUsername(perfilData.email.split('@')[0]);
          } else {
            setUsername("Usuario");
          }
          
          // Similarly check for avatar_url in both locations
          if (perfilData.profile && perfilData.profile.avatar_url) {
            setAvatarUrl(perfilData.profile.avatar_url);
          } else if (perfilData.avatar_url) {
            setAvatarUrl(perfilData.avatar_url);
          }
          
          // Load user achievements
          const logrosRes = await apiFetch("/logros/mis-logros");
          if (!logrosRes.ok) throw new Error("Error al cargar logros");
          const logrosData = await logrosRes.json();
          setLogros(logrosData);
          
          // Calculate total achievement points - Fixed type annotations
          const puntosLogros = logrosData.reduce((acc: number, logro: Logro) => acc + logro.puntos, 0);
          setTotalLogrosPuntos(puntosLogros);
          
          // Load user missions
          const misionesRes = await apiFetch("/misiones/mine");
          if (!misionesRes.ok) throw new Error("Error al cargar misiones");
          const misionesData = await misionesRes.json();
          setMisiones(misionesData);
          
          // Calculate mission points based on difficulty - Fixed type annotations
          const puntosMisiones = misionesData
            .filter((mision: Mision) => mision.status === "completed")
            .reduce((acc: number, mision: Mision) => {
              const dificultad = mision.difficulty || 1;
              // Points: 10 for easy (1), 20 for normal (3), 30 for difficult (5)
              const puntos = dificultad === 1 ? 10 : dificultad === 3 ? 20 : 30;
              return acc + puntos;
            }, 0);
          
          setTotalMisionesPuntos(puntosMisiones);
        } catch (error) {
          console.error("Error al cargar datos:", error);
        } finally {
          setLoading(false);
        }
      };
      
      cargarDatos();
    }, [])
  );

  const handleEditarPerfil = () => {
    router.push("/usuario/editar");
  };

  const handleVerRanking = () => {
    router.push("/usuario/2ranking");
  };

  const handleVerMisiones = () => {
    router.push("/misiones/listaMisiones");
  };

  const toggleMenu = () => {
    setMostrarMenu(!mostrarMenu);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/catedral.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <ScrollView className="flex-1">
        <View className="flex-1 p-4 pt-12">
          {/* Cabecera con avatar y nombre */}
          <View className="flex-row justify-between items-center mb-6">
            <View className="flex-row items-center">
              <View className="bg-blue-500 rounded-full overflow-hidden w-20 h-20 mr-4">
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-full h-full"
                  />
                ) : (
                  <Image
                    source={require("../../../assets/images/avatar.png")}
                    className="w-full h-full"
                  />
                )}
              </View>
              <View>
                <Text className="text-black text-xl font-bold">{username}</Text>
                <Text className="text-black text-lg">Nivel {nivel}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleMenu} className="p-2">
              <Ionicons name="settings-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Menú desplegable */}
          {mostrarMenu && (
            <View className="bg-white rounded-lg p-4 mb-4 shadow-md">
              <TouchableOpacity
                onPress={handleEditarPerfil}
                className="flex-row items-center py-2"
              >
                <Ionicons name="person-outline" size={20} color="black" />
                <Text className="text-black ml-2">Editar perfil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center py-2"
              >
                <Ionicons name="log-out-outline" size={20} color="red" />
                <Text className="text-red-500 ml-2">Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botón de Ranking */}
          <TouchableOpacity
            onPress={handleVerRanking}
            className="bg-amber-100 rounded-xl p-4 mb-4 shadow-sm"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-black font-bold text-lg">🏆 Ver Ranking</Text>
              <Ionicons name="chevron-forward" size={20} color="black" />
            </View>
          </TouchableOpacity>

          {/* Sección de Logros */}
          <View className="bg-white/80 rounded-xl p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-black font-bold text-lg">
                🏅 Logros ({totalLogrosPuntos} puntos)
              </Text>
            </View>
            
            {/* Lista de logros */}
            {logros.length > 0 ? (
              logros.map((logro) => (
                <View key={logro.id} className="flex-row justify-between py-2 border-b border-gray-200">
                  <Text className="text-black">{logro.icono} {logro.nombre}</Text>
                  <Text className="text-black font-medium">{logro.puntos} pts</Text>
                </View>
              ))
            ) : (
              <Text className="text-gray-500 py-2">No has conseguido logros aún</Text>
            )}
          </View>

          {/* Sección de Misiones */}
          <TouchableOpacity
            onPress={handleVerMisiones}
            className="bg-white/80 rounded-xl p-4 mb-4 shadow-sm"
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-black font-bold text-lg">
                ✅ Misiones completadas
              </Text>
              <View className="flex-row items-center">
                <Text className="text-black mr-1">Ver historial</Text>
                <Ionicons name="arrow-forward" size={16} color="black" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}
    