import { useState, useEffect } from "react";
import { apiFetch } from "../../../lib/api";
import * as SecureStore from "expo-secure-store";

import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ImageBackground,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


export default function EditarAvatar() {
  const [avatarSeleccionado, setAvatarSeleccionado] = useState<string | null>(null);
  const [username, setUsername] = useState<string>(""); // 🔑 Necesario para backend
  const router = useRouter();

  // 📁 Avatares locales prediseñados
  const avatares = [
    require("../../../assets/images/avatar.png"),
    require("../../../assets/images/avatar2.png"),
    require("../../../assets/images/avatar3.png"),
    require("../../../assets/images/avatar4.png"),
    require("../../../assets/images/avatar5.png"),
    require("../../../assets/images/avatar6.png"),

  ];

  // 🔁 Cargar el username actual
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const token = await SecureStore.getItemAsync("travelquest_token");
        const res = await apiFetch("/ajustes/perfil", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const data = await res.json();
        console.log("📥 Datos recibidos del perfil:", data);
  
        const usernameExtraido = data.profile?.username;
        if (usernameExtraido) {
          setUsername(usernameExtraido);
          console.log("✅ Username cargado:", usernameExtraido);
        } else {
          console.warn("⚠️ Username no encontrado en la respuesta");
        }
  
      } catch (err) {
        console.error("❌ Error cargando username:", err);
        Alert.alert("Error", "No se pudo obtener tu nombre de usuario.");
      }
    };
  
    fetchUsername();
  }, []);
  
  // 📷 Escoger imagen personalizada
  const seleccionarFoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setAvatarSeleccionado(uri);
    }
  };

  // ✅ Guardar avatar
  const guardarAvatar = async () => {
    if (!avatarSeleccionado) {
      Alert.alert("Selecciona un avatar", "Elige uno antes de guardar.");
      return;
    }
  
    try {
      const token = await SecureStore.getItemAsync("travelquest_token");
      
      console.log("🔒 Token obtenido:", token);
      console.log("🖼 Avatar seleccionado:", avatarSeleccionado);
      console.log("📤 Username enviado:", username);
      
      if (!username || username.trim() === "") {
        Alert.alert("Error", "No se ha podido cargar tu nombre de usuario.");
        return;
      }
      
      const res = await apiFetch("/ajustes/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar_url: avatarSeleccionado, username, 
        }),
      });
  
      const data = await res.json();
      console.log("📥 Respuesta del servidor:", data);

      if (!res.ok) {
        Alert.alert("Error", data.error || "No se pudo guardar el avatar.");
        return;
      }
  
      Alert.alert("Avatar guardado", "Tu avatar ha sido actualizado.");
      router.back(); // volver a editar perfil
    } catch (err) {
      Alert.alert("Error", "No se pudo conectar con el servidor.");
      console.error("Error guardando avatar:", err);
    }
  };
  return (
    <ImageBackground
      source={require("../../../assets/images/fondo.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 bg-white/20 pt-14 px-6">
        {/* Flecha para volver */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-4 z-10 bg-white rounded-full p-1"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="mt-6">
          {/* Título */}
          <View className="bg-white/80 rounded-xl px-4 py-2 shadow-md self-start mb-6 mt-6">
            <Text className="text-black text-xl font-bold">🎭 Elige tu avatar</Text>
          </View>

          {/* Avatares prediseñados */}
          <View className="flex-row flex-wrap justify-between mb-8">
            {avatares.map((avatar, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setAvatarSeleccionado(Image.resolveAssetSource(avatar).uri)}
                className={`rounded-full border-4 ${
                  avatarSeleccionado === Image.resolveAssetSource(avatar).uri
                    ? "border-[#C76F40]"
                    : "border-transparent"
                }`}
              >
                <Image source={avatar} className="w-24 h-24 m-2 rounded-full" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Botón usar foto propia */}
          <TouchableOpacity
            onPress={seleccionarFoto}
            className="bg-white/90 px-6 py-4 rounded-2xl shadow-md mb-6"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-black text-xl">📸</Text>
              <Text className="text-black font-bold text-lg">Usar una foto propia</Text>
              <Text className="text-black text-xl">→</Text>
            </View>
          </TouchableOpacity>

          {/* Botón guardar avatar */}
          <TouchableOpacity
            onPress={guardarAvatar}
            className="bg-white/90 px-6 py-4 rounded-2xl shadow-md"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-black text-xl">✅</Text>
              <Text className="text-black font-bold text-lg">Guardar avatar</Text>
              <Text className="text-black text-xl">→</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}
 