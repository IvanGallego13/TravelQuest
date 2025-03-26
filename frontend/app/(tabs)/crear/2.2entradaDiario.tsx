import { Text, View, TouchableOpacity, TextInput, Image, Alert } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";

interface Props {
  ciudad?: string;
  fecha?: string;
}

export default function CrearDiario({ ciudad, fecha }: Props) {
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { idDia } = useLocalSearchParams(); // <-- si existe, es edición de día

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePublish = async () => {
    if (!description && !imageUri) {
      Alert.alert("Entrada vacía", "Agrega una descripción o una imagen.");
      return;
    }

    setLoading(true);

    try {
      const imagenUrl = imageUri || null;

      let url = "";
      let body = {};

      if (idDia) {
        // Caso: añadir entrada a un día existente
        url = "https://tu-backend.com/api/entradas";
        body = {
          idDia,
          descripcion: description,
          imagen: imagenUrl,
        };
      } else {
        // Caso: entrada nueva (se creará diario/día si no existe)
        url = "https://tu-backend.com/api/diario";
        body = {
          ciudad,
          fecha,
          descripcion: description,
          imagen: imagenUrl,
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Error al guardar la entrada");

      Alert.alert("Éxito", "Tu entrada ha sido publicada");
      router.replace("../crear");
    } catch (error) {
      Alert.alert("Error", "No se pudo guardar la entrada");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F4EDE0] px-6 pt-10">
      <Text className="text-black font-bold text-lg mb-4">
        {idDia ? "Añadir entrada al día" : `${ciudad}  ${fecha}`}
      </Text>

      <TouchableOpacity
        onPress={handleImagePick}
        className="bg-gray-300 h-40 rounded-xl justify-center items-center mb-6"
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} className="w-full h-full rounded-xl" />
        ) : (
          <Text className="text-gray-700 text-center">
            Al pulsar opción de hacer foto o subirla
          </Text>
        )}
      </TouchableOpacity>

      <TextInput
        multiline
        numberOfLines={4}
        placeholder="Texto para descripción opcional"
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
        className="border border-[#699D81] rounded-xl p-4 mb-6 text-black"
      />

      <TouchableOpacity
        onPress={handlePublish}
        disabled={loading}
        className={`py-3 px-6 rounded-xl self-start ${
          loading ? "bg-gray-400" : "bg-[#C76F40]"
        }`}
      >
        <Text className="text-white font-semibold text-base">
          {loading ? "Publicando..." : "Publicar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
