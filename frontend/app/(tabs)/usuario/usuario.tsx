import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, ImageBackground } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../lib/api";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

// Definir tipos para logros y misiones
interface Logro {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  puntos: number;
  icono: string;
  unlocked: boolean;
  unlocked_at?: string;
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
  const [userLogros, setUserLogros] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      setMostrarMenu(false);
      cargarDatos();
    }, [])
  );

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
      
      // Establecer score (nivel del usuario)
      if (perfilData.profile && perfilData.profile.score !== undefined) {
        setScore(perfilData.profile.score);
      }
      
      // Cargar todos los logros disponibles
      const logrosRes = await apiFetch("/logros");
      if (!logrosRes.ok) throw new Error("Error al cargar logros");
      const todosLosLogros = await logrosRes.json();
      
      // Cargar logros del usuario
      const misLogrosRes = await apiFetch("/logros/mis-logros");
      if (!misLogrosRes.ok) throw new Error("Error al cargar mis logros");
      const misLogrosData = await misLogrosRes.json();
      
      // Guardar IDs de logros desbloqueados por el usuario
      const logrosDesbloqueados = misLogrosData.map((logro: any) => logro.achievement_id);
      setUserLogros(logrosDesbloqueados);
      
      // Marcar logros desbloqueados
      const logrosConEstado = todosLosLogros.map((logro: Logro) => ({
        ...logro,
        unlocked: logrosDesbloqueados.includes(logro.id),
        unlocked_at: misLogrosData.find((l: any) => l.achievement_id === logro.id)?.unlocked_at
      }));
      
      setLogros(logrosConEstado);
      
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Alert.alert("Error", "No se pudieron cargar los datos del perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      Alert.alert("Error", "No se pudo cerrar sesión");
    }
  };

  const handleVerRanking = () => {
    router.push("/usuario/2ranking");
  };

  const handleVerMisiones = () => {
    router.push("../misiones/listaMisiones");
  };

  const handleVerSobre = () => {
    router.push("/usuario/sobre");
  };
  const handleVereditar = () => {
    router.push("/usuario/editar");
  };

   return (
    <ImageBackground
      source={require("../../../assets/images/fondo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 px-6 pt-14">

        {/* Cabecera con avatar, nombre y menú */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center space-x-4">
            <Image
              source={avatarUrl ? { uri: avatarUrl } : require("../../../assets/images/avatar.png")}
              className="w-16 h-16 rounded-full"
            />
            <View>
              <Text className="text-white text-lg font-bold ms-4">{username}</Text>
              <Text className="text-white text-base ms-4">Nivel {score}</Text>
            </View>
          </View>

          <View className="relative">
            <TouchableOpacity
              onPress={() => setMostrarMenu(!mostrarMenu)}
              className="bg-white/80 rounded-full p-2 shadow-md"
            >
              <Ionicons name="ellipsis-vertical" size={22} color="#504382" />
            </TouchableOpacity>

            {mostrarMenu && (
              <View className="absolute top-12 right-0 bg-white/90 rounded-2xl shadow-md z-10 w-56 overflow-hidden">
                <TouchableOpacity
                  onPress={handleVerSobre}
                  className="flex-row items-center px-4 py-3 border-b border-gray-200"
                >
                  <Ionicons name="information-circle-outline" size={20} color="#000" />
                  <Text className="text-black ml-2">Sobre TravelQuest</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleVereditar}
                  className="flex-row items-center px-4 py-3 border-b border-gray-200"
                >
                  <Ionicons name="person-outline" size={20} color="#000" />
                  <Text className="text-black ml-2">Editar perfil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleLogout}
                  className="flex-row items-center px-4 py-3"
                >
                  <Ionicons name="log-out-outline" size={20} color="#C76F40" />
                  <Text className="text-[#C76F40] ml-2 font-semibold">Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Botones de acción */}
        <View className="flex-row justify-between mb-8">
          <TouchableOpacity
            onPress={handleVerRanking}
            className="bg-white/90 px-6 py-3 rounded-2xl shadow-md flex-1 mr-2"
          >
            <Text className="text-black font-bold text-center">🏆 Ver Ranking</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleVerMisiones}
            className="bg-white/90 px-6 py-3 rounded-2xl shadow-md flex-1 ml-2"
          >
            <Text className="text-black font-bold text-center">🧭 Ver Misiones</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 160 }}>
          {/* Sección logros */}
          <View className="bg-white/80 p-4 rounded-2xl shadow-md">
            <Text className="text-black font-bold text-base mb-4">
              Logros ({userLogros.length}/{logros.length})
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#699D81" />
            ) : (
              logros.map((logro) => (
                <View
                  key={logro.id}
                  className={`mb-4 p-3 rounded-xl ${
                    logro.unlocked ? "bg-white/90" : "bg-gray-100/70"
                  } shadow-sm`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-3 flex-1">
                      <Text className="text-2xl">{logro.icono}</Text>
                      <View className="flex-1">
                        <Text className={`font-bold ${logro.unlocked ? "text-[#699D81]" : "text-gray-400"}`}>
                          {logro.nombre}
                        </Text>
                        <Text className={logro.unlocked ? "text-black" : "text-gray-400"}>
                          {logro.descripcion}
                        </Text>
                        {logro.unlocked && logro.unlocked_at && (
                          <Text className="text-xs text-gray-500 mt-1">
                            Desbloqueado: {new Date(logro.unlocked_at).toLocaleDateString()}
                          </Text>
                        )}
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className={`font-bold ${logro.unlocked ? "text-[#C76F40]" : "text-gray-400"}`}>
                        +{logro.puntos}
                      </Text>
                      <View className="mt-1 flex-row items-center">
                        <Text className={`text-xs mr-1 ${logro.unlocked ? "text-[#699D81]" : "text-gray-400"}`}>
                          {logro.unlocked ? "Completado" : "Pendiente"}
                        </Text>
                        <Ionicons
                          name={logro.unlocked ? "checkmark-circle" : "lock-closed"}
                          size={14}
                          color={logro.unlocked ? "#699D81" : "#999"}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}