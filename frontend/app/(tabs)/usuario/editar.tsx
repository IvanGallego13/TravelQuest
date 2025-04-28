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
} from "react-native";
import { useRouter } from "expo-router";
import { apiFetch } from "../../../lib/api";
import * as SecureStore from "expo-secure-store";
import React from "react";

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
    <ScrollView className="flex-1 bg-[#F4EDE0] px-6 pt-10">
      <Text className="text-black text-xl font-bold mb-6">Editar perfil</Text>

      {/* 👤 Avatar y botón */}
      <TouchableOpacity
        onPress={() => router.push("/usuario/editar-avatar")}
        className="items-center mb-2"
      >
        <Image
          source={
            avatarUrl
              ? { uri: avatarUrl }
              : require("../../../assets/images/avatar.png")
          }
          className="w-24 h-24 rounded-full"
        />
        <Text className="text-[#699D81] mt-1 underline">Cambiar avatar</Text>

        
      </TouchableOpacity>
      <Text className="text-black mb-1 font-semibold text-lg text-center">{currentUsername}</Text>
      
      {/* 📧 Email */}
      <Text className="text-black font-semibold mb-1">Correo electrónico:</Text>
      <TextInput
        value={email}
        editable={false}
        className="bg-gray-200 border border-gray-400 rounded-md px-4 py-2 mb-4 text-black"
      />

      {/* 📝 Cambiar nombre de usuario */}
      <Text className="text-black font-semibold mb-1">Nombre de usuario:</Text>
      <TextInput
        value={newUsername}
        onChangeText={setNewUsername}
        placeholder="Ej: viajero23"
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
      />
      <TouchableOpacity
        onPress={handleUsernameChange}
        className="bg-[#C76F40] py-3 rounded-xl items-center mb-10"
      >
        <Text className="text-white font-semibold text-base">Guardar nombre</Text>
      </TouchableOpacity>

      {/* 🔐 Cambiar contraseña */}
      <Text className="text-black text-lg font-bold mb-4">Cambiar contraseña</Text>
      <Text className="text-black font-semibold mb-1">Contraseña actual:</Text>
      <TextInput
        value={oldPassword}
        onChangeText={setOldPassword}
        placeholder="Contraseña actual"
        secureTextEntry
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
      />
      <Text className="text-black font-semibold mb-1">Nueva contraseña:</Text>
      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="Nueva contraseña"
        secureTextEntry
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-6 text-black"
      />
      <TouchableOpacity
        onPress={handlePasswordChange}
        className="bg-[#699D81] py-3 rounded-xl items-center"
      >
        <Text className="text-white font-semibold text-base">Actualizar contraseña</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
