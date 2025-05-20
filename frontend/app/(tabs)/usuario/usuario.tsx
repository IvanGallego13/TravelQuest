import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator, ImageBackground, RefreshControl } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../lib/api";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

// Definir tipos para logros y misiones
interface Logro {  
  id: string;
  title: string;           // Changed from nombre
  description: string;     // Changed from descripcion
  category: string;        // Changed from categoria
  points: number;          // Changed from puntos
  icon: string;            // Changed from icono
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
  const [refreshing, setRefreshing] = useState(false);

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
      
      try {
        // Intentar cargar logros directamente desde el perfil completo
        if (perfilData.achievements) {
          // Si los logros ya vienen en la respuesta del perfil
          const logrosDesbloqueados = perfilData.achievements.map((logro: any) => logro.achievement_id);
          setUserLogros(logrosDesbloqueados);
          
          // Si también tenemos todos los logros disponibles
          if (perfilData.allAchievements) {
            const logrosConEstado = perfilData.allAchievements.map((logro: Logro) => ({
              ...logro,
              unlocked: logrosDesbloqueados.includes(logro.id),
              unlocked_at: perfilData.achievements.find((l: any) => l.achievement_id === logro.id)?.unlocked_at
            }));
            setLogros(logrosConEstado);
          } else {
            // Si no tenemos todos los logros, intentar cargarlos
            await cargarTodosLosLogros(logrosDesbloqueados);
          }
        } else {
          // Si no vienen en el perfil, intentar cargarlos por separado
          await cargarLogrosUsuario();
        }
      } catch (logrosError) {
        console.error("Error al cargar logros:", logrosError);
        // No interrumpir la carga del resto del perfil si los logros fallan
      }
      
    } catch (error) {
      console.error("Error al cargar datos:", error);
      Alert.alert("Error", "No se pudieron cargar los datos del perfil");
    } finally {
      setLoading(false);
    }
  };

  // Función para cargar todos los logros disponibles
  // Update the cargarTodosLosLogros function
  const cargarTodosLosLogros = async (logrosDesbloqueados: string[]) => {
    try {
      // Get ALL achievements from the achievements table
      let logrosRes = await apiFetch("/achievements");
      
      // If that fails, try alternative endpoints
      if (!logrosRes.ok) {
        console.log("Intentando ruta alternativa para todos los logros...");
        logrosRes = await apiFetch("/logros");
      
        if (!logrosRes.ok) {
          // If both endpoints fail, create some default achievements
          console.log("No se pudo acceder a los logros. Usando logros por defecto...");
          
          const defaultLogros = [
            {
              id: "1",
              title: "Primera parada",
              description: "Visita tu primera ciudad",
              category: "exploración",
              points: 10,
              icon: "🌍"
            },
            {
              id: "5",
              title: "Primer paso",
              description: "Completa tu primera misión",
              category: "misiones",
              points: 10,
              icon: "🪂"
            },
            {
              id: "6",
              title: "Reto inicial",
              description: "Completa una misión de dificultad fácil",
              category: "misiones",
              points: 10,
              icon: "🎯"
            },
            {
              id: "7",
              title: "En marcha",
              description: "Completa una misión de dificultad normal",
              category: "misiones",
              points: 20,
              icon: "🚶"
            }
          ];
          
          // Mark which achievements are unlocked
          const logrosConEstado = defaultLogros.map((logro: any) => ({
            ...logro,
            unlocked: logrosDesbloqueados.includes(logro.id),
            unlocked_at: null
          }));
          
          setLogros(logrosConEstado);
          return;
        }
      }
      
      const todosLosLogros = await logrosRes.json();
      console.log("📊 Todos los logros cargados:", todosLosLogros.length);
      
      // Mark which achievements are unlocked
      const logrosConEstado = todosLosLogros.map((logro: any) => ({
        id: logro.id,
        title: logro.title || logro.nombre,
        description: logro.description || logro.descripcion,
        category: logro.category || logro.categoria,
        points: logro.points || logro.puntos,
        icon: logro.icon || logro.icono,
        unlocked: logrosDesbloqueados.includes(logro.id),
        unlocked_at: null
      }));
      
      setLogros(logrosConEstado);
    } catch (error) {
      console.error("Error cargando todos los logros:", error);
      throw error;
    }
  };
  
  // Update the cargarLogrosUsuario function
  const cargarLogrosUsuario = async () => {
    try {
      // Get user's unlocked achievements
      let misLogrosRes = await apiFetch("/logros/mis-logros");
      
      if (!misLogrosRes.ok) {
        console.log("Intentando ruta alternativa para mis logros...");
        misLogrosRes = await apiFetch("/achievements/user");
      
        if (!misLogrosRes.ok) {
          throw new Error("No se pudo acceder a los logros del usuario");
        }
      }
      
      const misLogrosData = await misLogrosRes.json();
      console.log("🏆 Mis logros cargados:", misLogrosData.length);
      
      // Extract achievement IDs
      const logrosDesbloqueados = misLogrosData.map((logro: any) => 
        logro.achievement_id || logro.id
      );
      setUserLogros(logrosDesbloqueados);
      
      // Now load all available achievements
      await cargarTodosLosLogros(logrosDesbloqueados);
    } catch (error) {
      console.error("Error cargando logros del usuario:", error);
      throw error;
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

  // Function to manually check for achievements
  const checkAchievements = async () => {
    try {
      setRefreshing(true);
      
      // First try the /logros/check-all endpoint
      let checkRes = await apiFetch("/logros/check-all", {
        method: "POST"
      });
      
      // If that fails, try alternative endpoints
      if (!checkRes.ok) {
        console.log("Intentando ruta alternativa para verificar logros...");
        
        // Try the /achievements/check endpoint as an alternative
        checkRes = await apiFetch("/achievements/check", {
          method: "POST"
        });
        
        // If that also fails, try one more alternative
        if (!checkRes.ok) {
          // Try a GET request to refresh achievements instead
          checkRes = await apiFetch("/logros/refresh", {
            method: "GET"
          });
          
          if (!checkRes.ok) {
            throw new Error("No se pudo encontrar un endpoint válido para verificar logros");
          }
        }
      }
      
      const checkData = await checkRes.json();
      
      // Show notification if new achievements were unlocked
      if (checkData.newAchievements && checkData.newAchievements.length > 0) {
        Alert.alert(
          "¡Logro desbloqueado!",
          `Has desbloqueado "${checkData.newAchievements[0].title}" y ganado ${checkData.pointsEarned} puntos.`
        );
      } else {
        // If no specific achievement data is returned, just refresh the data
        await cargarDatos();
        Alert.alert(
          "Logros actualizados",
          "Se han actualizado tus logros correctamente."
        );
      }
      
      // Refresh user data to show updated achievements
      await cargarDatos();
    } catch (error) {
      console.error("Error checking achievements:", error);
      
      // Even if checking fails, try to refresh the data anyway
      try {
        await cargarDatos();
      } catch (refreshError) {
        console.error("Error refreshing data after achievement check failed:", refreshError);
      }
      
      Alert.alert(
        "Error", 
        "No se pudieron verificar los logros. El servidor puede estar en mantenimiento."
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Function to handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await cargarDatos();
    setRefreshing(false);
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

        <ScrollView 
          contentContainerStyle={{ paddingBottom: 160 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Add refresh achievements button */}
          <View className="mt-4 mb-2 flex-row justify-end">
            <TouchableOpacity 
              onPress={checkAchievements}
              className="bg-[#3B82F6] py-2 px-4 rounded-lg flex-row items-center"
            >
              <Ionicons name="refresh" size={18} color="white" />
              <Text className="text-white ml-2 font-medium">Verificar logros</Text>
            </TouchableOpacity>
          </View>
          
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
                      <Text className="text-2xl">{logro.icon}</Text>
                      <View className="flex-1">
                        <Text className={`font-bold ${logro.unlocked ? "text-[#699D81]" : "text-gray-400"}`}>
                          {logro.title}
                        </Text>
                        <Text className={logro.unlocked ? "text-black" : "text-gray-400"}>
                          {logro.description}
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
                        +{logro.points}
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