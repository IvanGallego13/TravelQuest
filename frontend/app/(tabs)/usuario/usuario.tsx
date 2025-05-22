import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
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
    <View className="flex-1 bg-[#F4EDE0]">
      {/* Cabecera con avatar y nombre */}
      <View className="pt-14 pb-6 px-6 bg-white">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="w-16 h-16 rounded-full mr-4 overflow-hidden bg-[#fff3e9] justify-center items-center">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-16 h-16 rounded-full"
                  defaultSource={require("../../../assets/images/avatar.png")}
                />
              ) : (
                <Image
                  source={require("../../../assets/images/avatar.png")}
                  className="w-16 h-16 rounded-full"
                />
              )}
            </View>
            <View>
              <Text className="text-black text-xl font-bold">{username}</Text>
              <Text className="text-black text-base">Nivel {score}</Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={() => setMostrarMenu(!mostrarMenu)}
            className="p-2"
          >
            <Ionicons name="ellipsis-vertical" size={24} color="black" />
          </TouchableOpacity>
        </View>
        
        {/* Menú desplegable */}
        {mostrarMenu && (
          <View className="absolute right-6 top-24 bg-white shadow-md rounded-md z-10 w-48">
            <TouchableOpacity
              className="flex-row items-center p-3 border-b border-gray-200"
              onPress={handleVerSobre}
            >
              <Ionicons name="information-circle-outline" size={20} color="black" className="mr-2" />
              <Text className="text-black ml-2">Sobre TravelQuest</Text>
            </TouchableOpacity>
            
            {/* Añadir opción de Editar Perfil */}
            <TouchableOpacity
              className="flex-row items-center p-3 border-b border-gray-200"
              onPress={handleVereditar}
            >
              <Ionicons name="person-outline" size={20} color="black" className="mr-2" />
              <Text className="text-black ml-2">Editar perfil</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              className="flex-row items-center p-3"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="red" className="mr-2" />
              <Text className="text-red-500 ml-2">Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Botones de acción */}
        <View className="flex-row justify-around mt-6">
          <TouchableOpacity
            className="bg-[#699D81] px-4 py-2 rounded-md"
            onPress={handleVerRanking}
          >
            <Text className="text-white font-semibold">Ver Ranking</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="bg-[#699D81] px-4 py-2 rounded-md"
            onPress={handleVerMisiones}
          >
            <Text className="text-white font-semibold">Ver Misiones</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Contenido principal */}
      <ScrollView className="flex-1 px-6 pt-4">
        {loading ? (
          <ActivityIndicator size="large" color="#699D81" style={{ marginTop: 20 }} />
        ) : (
          <>
            {/* Sección de Logros */}
            <View className="mb-6">
              <Text className="text-black text-lg font-bold mb-2">
                Logros ({userLogros.length}/{logros.length})
              </Text>
              <View className="bg-white rounded-lg shadow-sm p-4">
                {logros.length > 0 ? (
                  logros.map((logro) => (
                    <View 
                      key={logro.id} 
                      className={`mb-4 p-3 rounded-md ${logro.unlocked ? 'bg-[#F0F7F2]' : 'bg-gray-100'}`}
                    >
                      <View className="flex-row items-center">
                        <Text className="text-2xl mr-2">{logro.icono}</Text>
                        <View className="flex-1">
                          <Text className={`font-bold ${logro.unlocked ? 'text-[#699D81]' : 'text-gray-400'}`}>
                            {logro.nombre}
                          </Text>
                          <Text className={logro.unlocked ? 'text-black' : 'text-gray-400'}>
                            {logro.descripcion}
                          </Text>
                          {logro.unlocked && logro.unlocked_at && (
                            <Text className="text-xs text-gray-500 mt-1">
                              Desbloqueado: {new Date(logro.unlocked_at).toLocaleDateString()}
                            </Text>
                          )}
                        </View>
                        <View className="items-end">
                          <Text className={`font-bold ${logro.unlocked ? 'text-[#C76F40]' : 'text-gray-400'}`}>
                            +{logro.puntos}
                          </Text>
                          <View className="mt-1 flex-row items-center">
                            <Text className={`text-xs mr-1 ${logro.unlocked ? 'text-[#699D81]' : 'text-gray-400'}`}>
                              {logro.unlocked ? 'Completado' : 'Pendiente'}
                            </Text>
                            {logro.unlocked ? (
                              <Ionicons name="checkmark-circle" size={14} color="#699D81" />
                            ) : (
                              <Ionicons name="lock-closed" size={14} color="#999" />
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text className="text-gray-500 text-center py-2">Cargando logros...</Text>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
    