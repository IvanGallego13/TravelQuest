import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { apiFetch } from "@/lib/api"; // tu helper para llamadas al backend

export default function Mision() {
  const router = useRouter();
  const { missionId, title, description } = useLocalSearchParams();
  const [missionResponse, setMissionResponse] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [completada, setCompletada] = useState(false);

  const numericMissionId = Number(missionId);

  const sendToBackend = async (status: "completed" | "accepted" | "discarded") => {
    try {
      const body: any = {
        status,
      };

      if (status === "completed") {
        body.completed_at = new Date().toISOString();
        body.image_url = imageUri;
        body.response = missionResponse;
      }

      const res = await apiFetch(`/api/misiones/usuario/${numericMissionId}`, {
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
    if (!missionResponse && !imageUri) {
      Alert.alert("Misión vacía", "Agrega al menos una respuesta o imagen.");
      return;
    }
     // Validar imagen si hay una
    if (imageUri) {
      try {
        const res = await apiFetch(`/api/misiones/${missionId}/validate-image`, {
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
    sendToBackend("completed");
  };

  const handleSaveForLater = () => {
    sendToBackend("accepted");
  };

  const handleDiscard = () => {
    sendToBackend("discarded");
  };

  const handleBack = () => {
    handleDiscard();
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (!completada) {
          handleDiscard();
        }
      };
    }, [completada])
  );

  const handleTakePhoto = () => {
    Alert.alert("Simulado", "Abrir cámara");
    // Aquí irá lógica de cámara en el futuro
  };

  const handlePickImage = () => {
    Alert.alert("Simulado", "Seleccionar imagen");
    // Aquí irá lógica de galería en el futuro
  };

  return (
    <View className="flex-1 bg-[#F4EDE0] px-6 pt-10">
      {/* Volver */}
      <TouchableOpacity onPress={handleBack} className="absolute top-10 left-4 z-10">
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      <Text className="text-black font-bold text-lg mb-4 text-center">
        {title ?? "Misión sin título"}
      </Text>

      <Text className="text-black mb-4">
        {description ?? "Descripción no disponible"}
      </Text>

      <TextInput
        multiline
        placeholder="Aquí responde a la misión"
        placeholderTextColor="#444"
        value={missionResponse}
        onChangeText={setMissionResponse}
        className="border border-[#699D81] rounded-xl p-4 mb-6 text-black"
        style={{ minHeight: 100 }}
      />

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

      <View className="space-y-3">
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
    </View>
  );
}

