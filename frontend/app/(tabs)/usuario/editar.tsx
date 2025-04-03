import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { apiFetch } from "@/lib/api";
import * as SecureStore from "expo-secure-store";

export default function EditarUsuario() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔁 Cargar perfil al montar componente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await SecureStore.getItemAsync("travelquest_token");

        const res = await apiFetch("/api/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setEmail(data.user.email);
        setUsername(data.profile.username);
        setAvatarUrl(data.profile.avatar || "");
      } catch (err) {
        Alert.alert("Error", "No se pudo cargar el perfil.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 💾 Guardar cambios
  const handleGuardar = async () => {
    try {
      const token = await SecureStore.getItemAsync("travelquest_token");

      const res = await apiFetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) throw new Error("Error al guardar cambios");

      Alert.alert("Perfil actualizado", "Tu nombre de usuario ha sido guardado.");
      router.back();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar tu perfil.");
      console.error(error);
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
    <View className="flex-1 bg-[#F4EDE0] px-6 pt-10">
      <Text className="text-black text-xl font-bold mb-6">Editar perfil</Text>

      {/* 👤 Avatar y botón */}
      <TouchableOpacity
        onPress={() => router.push("/usuario/editar-avatar")}
        className="items-center mb-6"
      >
        <Image
          source={
            avatarUrl
              ? { uri: avatarUrl }
              : require("@/assets/images/avatar.png")
          }
          className="w-24 h-24 rounded-full"
        />
        <Text className="text-[#699D81] mt-2 underline">Cambiar avatar</Text>
      </TouchableOpacity>

      {/* 📧 Email */}
      <Text className="text-black font-semibold mb-1">Correo electrónico:</Text>
      <TextInput
        value={email}
        editable={false}
        className="bg-gray-200 border border-gray-400 rounded-md px-4 py-2 mb-4 text-black"
      />

      {/* 📝 Nombre de usuario */}
      <Text className="text-black font-semibold mb-1">Nombre de usuario:</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Ej: viajero23"
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-6 text-black"
      />

      {/* ✅ Botón Guardar */}
      <TouchableOpacity
        onPress={handleGuardar}
        className="bg-[#C76F40] py-3 rounded-xl items-center"
      >
        <Text className="text-white font-semibold text-base">Guardar cambios</Text>
      </TouchableOpacity>
    </View>
  );
}
