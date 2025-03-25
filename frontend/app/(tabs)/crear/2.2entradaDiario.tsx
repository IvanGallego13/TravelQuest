import { Text, View, TouchableOpacity, TextInput, Image } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

export default function CrearDiario() {
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const router = useRouter();

  //Simula la selección de una imagen
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  //Simula el envío de la entrada del diario
  const handlePublish = () => {
    console.log("Publicando entrada de diario:", { description, imageUri });
    // Aquí iría la lógica de guardado en BD
    router.replace("../crear"); // Redirige al inicio al publicar
  };

  return (
    <View className="flex-1 bg-[#F4EDE0] p-6">
      {/* Encabezado con ubicación y fecha (simulado) */}
      <Text className="text-black font-bold text-lg mb-2">Salamanca  13/3/25</Text>

      {/* Zona para subir o tomar imagen */}
      <TouchableOpacity
        onPress={handleImagePick}
        className="bg-gray-300 h-40 rounded-md justify-center items-center mb-4"
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} className="w-full h-full rounded-md" />
        ) : (
          <Text className="text-black">Al pulsar opción de hacer foto o subirla</Text>
        )}
      </TouchableOpacity>

      {/* Campo de descripción opcional */}
      <TextInput
        multiline
        numberOfLines={4}
        placeholder="Texto para descripción opcional"
        value={description}
        onChangeText={setDescription}
        className="border border-[#699D81] rounded-md p-3 mb-4 text-black"
      />

      {/* Botón Publicar */}
      <TouchableOpacity
        onPress={handlePublish}
        className="bg-[#C76F40] py-3 px-6 rounded-md self-start"
      >
        <Text className="text-white font-semibold">Publicar</Text>
      </TouchableOpacity>
    </View>
  );
}
