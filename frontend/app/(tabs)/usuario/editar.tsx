import { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import { apiFetch } from "../../../lib/api";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { Ionicons } from '@expo/vector-icons';

export default function EditarUsuario() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [currentUsername, setCurrentUsername] = useState(""); // 👈 nombre real
  const [newUsername, setNewUsername] = useState(""); // 👈 nombre nuevo que se edita
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔁 Cargar perfil al montar componente
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
          
          if (data.profile.username) {
            setCurrentUsername(data.profile.username);
            setNewUsername(data.profile.username);
          }
          
          if (data.profile.avatar_url) {
            setAvatarUrl(data.profile.avatar_url);
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
  const handleUsernameChange = async () => {
    try {
      const token = await SecureStore.getItemAsync("travelquest_token");
      
      const res = await apiFetch("/ajustes/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: newUsername }),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      Alert.alert("Nombre actualizado", "Tu nombre de usuario ha sido cambiado.");
      setCurrentUsername(newUsername); // 👈 Actualizar visualmente
    } catch (err) {
      Alert.alert("Error", "No se pudo cambiar el nombre.");
      console.error(err);
    }
  };


  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword) {
      return Alert.alert("Error", "Completa ambos campos.");
    }

    try {
      const token = await SecureStore.getItemAsync("travelquest_token");

      const res = await apiFetch("/ajustes/cambiar-Contrasena", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          actual: oldPassword,
          nueva: newPassword,
        }),
      });
      
      const data = await res.json();
      console.log("🧠 Perfil recibido:", data);

      if (!res.ok) {
        Alert.alert("Error", data.error || "No se pudo cambiar la contraseña.");
        return;
      }

      Alert.alert("Contraseña actualizada", "Tu nueva contraseña se ha guardado.");
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      Alert.alert("Error", "No se pudo actualizar la contraseña.");
      console.error(err);
    }
  }; 

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F4EDE0]">
        <ActivityIndicator size="large" color="#699D81" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../../assets/images/nubes.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 bg-white/20 pt-14 px-6">
        {/* Flecha para volver */}
        <TouchableOpacity onPress={() => router.push("/usuario/usuario")} className="absolute top-12 left-4 z-10 bg-white rounded-full p-1">
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ paddingBottom: 150 }} className="mt-4">

          {/* Avatar */}
          <View className="items-center">
              <View className="items-center">
                <Image
                  source={
                    avatarUrl
                      ? { uri: avatarUrl }
                      : require("../../../assets/images/avatar.png")
                  }
                  className="w-24 h-24 rounded-full mb-4"
                />

                <TouchableOpacity
                  onPress={() => router.push("/usuario/editar-avatar")}
                  className="bg-white/90 px-6 py-2 rounded-2xl shadow-md flex-row items-center justify-between w-60"
                >
                  <Text className="text-black font-bold text-base">Cambiar avatar</Text>
                  <Text className="text-black text-xl">→</Text>
                </TouchableOpacity>

                <Text className="text-black mt-3 font-semibold text-lg text-center">{currentUsername}</Text>
              </View>
          </View>

          {/* Tarjeta de datos */}
          <View className="bg-white/90 rounded-2xl shadow-md p-6 space-y-5 mb-5">

            {/* Email */}
            <View>
              <Text className="text-black font-semibold mb-2">📧 Correo electrónico:</Text>
              <TextInput
                value={email}
                editable={false}
                className="bg-gray-200 rounded-xl px-4 py-3 text-black"
              />
            </View>

            {/* Cambiar usuario */}
            <View>
              <Text className="text-black font-semibold mb-2 mt-3">👤 Nombre de usuario:</Text>
              <TextInput
                value={newUsername}
                onChangeText={setNewUsername}
                placeholder="Ej: viajero23"
                placeholderTextColor="#888"
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-black"
              />
              <TouchableOpacity
                onPress={handleUsernameChange}
                className="bg-white/90 px-6 py-4 rounded-2xl shadow-md mt-4"
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-black text-xl">💾</Text>
                  <Text className="text-black font-bold text-lg">Guardar nombre</Text>
                  <Text className="text-black text-xl">→</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Tarjeta contraseña */}
          <View className="bg-white/90 rounded-2xl shadow-md p-6 space-y-5">
            <Text className="text-black font-bold text-lg mb-3">🔒 Cambiar contraseña</Text>

            <View>
              <Text className="text-black font-semibold mb-2">Contraseña actual:</Text>
              <TextInput
                value={oldPassword}
                onChangeText={setOldPassword}
                placeholder="Contraseña actual"
                secureTextEntry
                placeholderTextColor="#888"
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-black"
              />
            </View>

            <View>
              <Text className="text-black font-semibold mb-2 mt-3">Nueva contraseña:</Text>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Nueva contraseña"
                secureTextEntry
                placeholderTextColor="#888"
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-black"
              />
            </View>

            <TouchableOpacity
              onPress={handlePasswordChange}
              className="bg-white/90 px-6 py-4 rounded-2xl shadow-md mt-2"
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-black text-xl">🔐</Text>
                <Text className="text-black font-bold text-lg">Actualizar contraseña</Text>
                <Text className="text-black text-xl">→</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}