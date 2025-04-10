import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { apiFetch } from "@/lib/api"; // tu helper para llamadas al backend
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";

export default function Mision() {
  const router = useRouter();
  const { missionId, title, description } = useLocalSearchParams();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [completada, setCompletada] = useState(false);
  const [estadoManual, setEstadoManual] = useState<"completed" | "accepted" | "discarded" | null>(null);


  const numericMissionId = Number(missionId);

  const sendToBackend = async (status: "completed" | "accepted" | "discarded") => {
    try {
      const body: any = {
        status,
      };

      if (status === "completed") {
        body.completed_at = new Date().toISOString();
        body.image_url = imageUri;
        //body.response = missionResponse;
      }
      console.log("📍 missionId a enviar:", numericMissionId);

      const res = await apiFetch(`/misiones/usuario/${numericMissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error actualizando misión");

      setCompletada(true);
      router.replace("/(tabs)/crear");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo actualizar la misión.");
    }
  };

  const handleSubmit = async () => {
    if (!imageUri) {
      Alert.alert("Misión vacía", "Agrega al menos una respuesta o imagen.");
      return;
    }
     // Validar imagen si hay una
    if (imageUri) {
      try {
        const res = await apiFetch(`/misiones/${missionId}/validate-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_url: imageUri }),
        });

        if (!res.ok) {
          const err = await res.json();
          Alert.alert("Imagen no válida", err.message || "La imagen no es adecuada para esta misión.");
          return;
        }
      } catch (error) {
        console.error("Error en validación de imagen", error);
        Alert.alert("Error", "No se pudo validar la imagen.");
        return;
      }
    }
    setEstadoManual("completed");
    sendToBackend("completed");
  };

  const handleSaveForLater = () => {
    setEstadoManual("accepted");
    sendToBackend("accepted");
  };

  const handleDiscard = () => {
    setEstadoManual("discarded");
    sendToBackend("discarded");
  };

  const handleBack = () => {
    handleDiscard();
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (!completada && !estadoManual) {
          handleDiscard();
        }
      };
    }, [completada, estadoManual])
  );

  const handleTakePhoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permiso denegado", "No se puede acceder a la cámara.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
  
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-1 bg-[#F4EDE0] pt-10">
      {/* Volver */}
      <TouchableOpacity onPress={handleBack} className="absolute top-10 left-4 z-10">
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <ScrollView className="flex-1 px-6">
        <Text className="text-black font-bold text-lg mb-4 text-center">
          {title ?? "Misión sin título"}
        </Text>

        
        <Text className="text-black mb-4">
          {description ?? "Descripción no disponible"}
        </Text>
        
        <View className="bg-gray-200 rounded-xl items-center justify-center p-6 mb-6">
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={{ width: 120, height: 120, marginBottom: 10 }} />
          ) : (
            <Image
              source={require("@/assets/images/icon.png")}
              style={{ width: 40, height: 40, marginBottom: 10 }}
            />
          )}

          <Text className="text-gray-600 text-center mb-2">
            Al pulsar, opción de hacer foto o subirla
          </Text>

          <View className="flex-row gap-4">
            <TouchableOpacity
              className="bg-[#699D81] px-3 py-2 rounded-md"
              onPress={handleTakePhoto}
            >
              <Text className="text-white text-sm">Tomar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-[#C76F40] px-3 py-2 rounded-md"
              onPress={handlePickImage}
            >
              <Text className="text-white text-sm">Subir imagen</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="space-y-3 pb-10">
          <TouchableOpacity
            className="bg-[#699D81] py-3 rounded-xl items-center"
            onPress={handleDiscard}
          >
            <Text className="text-white font-semibold text-base">Descartar misión</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#C76F40] py-3 rounded-xl items-center"
            onPress={handleSubmit}
          >
            <Text className="text-white font-semibold text-base">Enviar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-[#699D81] py-3 rounded-xl items-center"
            onPress={handleSaveForLater}
          >
            <Text className="text-white font-semibold text-base">Guardar para más tarde</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );  
}

