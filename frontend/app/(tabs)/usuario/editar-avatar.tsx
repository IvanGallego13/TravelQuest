import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

export default function EditarAvatar() {
  const [avatarSeleccionado, setAvatarSeleccionado] = useState<string | null>(null);
  const router = useRouter();

  // 📁 Avatares locales prediseñados
  const avatares = [
    require("@/assets/images/avatar.png"),
    require("@/assets/images/avatar2.png"),
    require("@/assets/images/avatar3.png"),
    require("@/assets/images/avatar4.png"),
    require("@/assets/images/avatar5.png"),
    require("@/assets/images/avatar6.png"),

  ];

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

    // Aquí puedes hacer:
    // - subir a Supabase Storage
    // - guardar en tu backend el path/URL

    Alert.alert("Avatar guardado", "Tu avatar ha sido actualizado.");
    router.back(); // Volver a editar perfil
  };

  return (
    <ScrollView className="flex-1 bg-[#F4EDE0] px-6 pt-10">
      <Text className="text-black text-xl font-bold mb-4">Elige tu avatar</Text>

      {/* 🖼 Avatares prediseñados */}
      <View className="flex-row flex-wrap justify-between mb-6">
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
            <Image
              source={avatar}
              className="w-24 h-24 m-2 rounded-full"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* 📷 Subir foto propia */}
      <TouchableOpacity
        onPress={seleccionarFoto}
        className="bg-[#699D81] py-3 rounded-xl items-center mb-6"
      >
        <Text className="text-white font-semibold text-base">Usar una foto propia</Text>
      </TouchableOpacity>

      {/* ✅ Botón guardar */}
      <TouchableOpacity
        onPress={guardarAvatar}
        className="bg-[#C76F40] py-3 rounded-xl items-center"
      >
        <Text className="text-white font-semibold text-base">Guardar avatar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
