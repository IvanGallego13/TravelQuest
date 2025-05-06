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


/* Simulación de datos del usuario
const logros = [
  { id: 1, nombre: "Logro 1", puntos: 50 },
  { id: 2, nombre: "Logro 2", puntos: 80 },
  { id: 3, nombre: "Logro 3", puntos: 100 },
];

const misiones = [
  { id: 1, nombre: "Misión 1", puntos: 60 },
  { id: 2, nombre: "Misión 2", puntos: 90 },
  { id: 3, nombre: "Misión 3", puntos: 70 },
];
*/

/*const [logros, setLogros] = useState([]);
const [misiones, setMisiones] = useState([]);

useEffect(() => {
  const fetchDatos = async () => {
    const resLogros = await fetch("https://api.tuapp.com/usuario/logros");
    const resMisiones = await fetch("https://api.tuapp.com/usuario/misiones");
    const dataLogros = await resLogros.json();
    const dataMisiones = await resMisiones.json();
    setLogros(dataLogros);
    setMisiones(dataMisiones);
  };

  fetchDatos();
}, []);
*/

export default function Usuario() {
  
  // Simulación de datos del usuario
  const logros = [
    { id: 1, nombre: "Logro 1", puntos: 50 },
    { id: 2, nombre: "Logro 2", puntos: 80 },
    { id: 3, nombre: "Logro 3", puntos: 100 },
  ];

  const misiones = [
    { id: 1, nombre: "Misión 1", puntos: 60 },
    { id: 2, nombre: "Misión 2", puntos: 90 },
    { id: 3, nombre: "Misión 3", puntos: 70 },
  ];

// Cálculo de puntos
  const totalLogros = logros.reduce((acc, l) => acc + l.puntos, 0);
  const totalMisiones = misiones.reduce((acc, m) => acc + m.puntos, 0);
  const nivel = totalLogros + totalMisiones;
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const { logout } = useAuth();
  
//const nivel = logros.reduce((acc, l) => acc + l.puntos, 0) +
//              misiones.reduce((acc, m) => acc + m.puntos, 0);
const [username, setUsername] = useState("");

useFocusEffect(
  React.useCallback(() => {
    const cargarPerfil = async () => {
      try {
        const token = await SecureStore.getItemAsync("travelquest_token");

        const res = await apiFetch("/ajustes/perfil", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("🧠 Perfil recibido:", data);

        if (data.profile.avatar_url) {
          setAvatarUrl(data.profile.avatar_url);
        }
        if (data.profile.username) {
          setUsername(data.profile.username);
        }
      } catch (err) {
        console.error("Error al cargar avatar en usuario.tsx:", err);
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, [])
);

  return (
    <ImageBackground
      source={require("../../../assets/images/tren.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 bg-white/20 relative">

        {/* Botón ajustes */}
        <View className="absolute top-10 right-4 z-20 bg-white/90 p-2 rounded-full shadow-md">
          <TouchableOpacity onPress={() => setMostrarMenu(!mostrarMenu)}>
            <Ionicons name="settings-outline" size={24} color="#C76F40" />
          </TouchableOpacity>

          {mostrarMenu && (
            <View className="absolute top-14 right-0 bg-white rounded-2xl shadow-md w-56 border border-gray-200 z-30">
              <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <Ionicons name="settings-outline" size={20} color="#699D81" />
                <Text className="text-black font-semibold ml-2">Ajustes</Text>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setMostrarMenu(false);
                  router.push("/usuario/editar");
                }}
                className="flex-row items-center px-4 py-3 border-b border-gray-100"
              >
                <MaterialIcons name="edit" size={20} color="#000" />
                <Text className="text-black ml-2">Editar perfil</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setMostrarMenu(false);
                  logout();
                  router.replace("/login");
                }}
                className="flex-row items-center px-4 py-3 border-b border-gray-100"
              >
                <Ionicons name="lock-closed-outline" size={20} color="#C76F40" />
                <Text className="text-[#C76F40] ml-2 font-semibold">Cerrar sesión</Text>
              </TouchableOpacity>

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

        {/* Scroll principal */}
        <ScrollView className="px-6 pt-20 pb-60" showsVerticalScrollIndicator={false}>
          {/* Perfil */}
          <View className="items-center mb-6">
            <Image
              source={
                avatarUrl
                  ? { uri: avatarUrl }
                  : require("../../../assets/images/avatar.png")
              }
              className="w-28 h-28 rounded-full mb-4"
            />
            <Text className="text-black font-bold text-xl">{username}</Text>
            <Text className="text-black text-base mb-3">Nivel {nivel}</Text>

            <TouchableOpacity
              onPress={() => router.push("../usuario/2ranking")}
              className="bg-white/90 px-6 py-3 rounded-2xl shadow-md"
            >
              <Text className="text-black font-semibold text-base">🏆 Ver Ranking</Text>
            </TouchableOpacity>
          </View>

          {/* Logros con altura mayor */}
          <View className="bg-white/80 px-4 py-5 rounded-2xl shadow-md mb-10 min-h-[300px]">
            <Text className="text-black font-bold text-lg mb-4">🎖️ Logros ({totalLogros} puntos)</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {logros.map((logro) => (
                <View
                  key={logro.id}
                  className="bg-white/90 px-4 py-2 rounded-xl shadow mb-3 flex-row justify-between items-center"
                >
                  <Text className="text-black text-base font-medium truncate max-w-[65%]">
                    {logro.nombre}
                  </Text>
                  <Text className="text-[#C76F40] font-bold text-sm">{logro.puntos} pts</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Misiones ahora más arriba */}
        <View className="absolute bottom-28 left-6 right-6 bg-white/90 shadow-md rounded-2xl px-5 py-4">
          <Text className="text-black font-bold text-lg mb-2">✅ Misiones completadas ({totalMisiones} puntos)</Text>
          <TouchableOpacity
            onPress={() => router.push("../misiones/misiones")}
            className="bg-white px-6 py-3 rounded-xl shadow-md flex-row justify-between items-center"
          >
            <Text className="text-black font-semibold text-base">📚 Ver historial</Text>
            <Text className="text-black text-xl">→</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ImageBackground>
  );
}
    