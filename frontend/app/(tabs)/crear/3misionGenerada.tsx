import { useState, useCallback } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native"; // Hook que detecta si el usuario deja la pantalla

export default function Mision() {
  const router = useRouter();

  // Recibe los parámetros de navegación: misión, ciudad, fecha, etc.
  const { idMision, titulo, descripcion, ciudad, fecha } = useLocalSearchParams();

  // Estado local para la respuesta del usuario
  const [missionResponse, setMissionResponse] = useState("");

  // Imagen que el usuario sube o selecciona
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Marca si la misión ya fue completada, para evitar descartarla al salir
  const [completada, setCompletada] = useState(false);

  // Simulación de tomar una foto (con cámara)
  const handleTakePhoto = () => {
    Alert.alert("Simulado", "Abrir cámara");
  };

  // Simulación de seleccionar una imagen de la galería
  const handlePickImage = () => {
    Alert.alert("Simulado", "Seleccionar desde galería");
  };

  // Hook que se ejecuta si el usuario sale de la pantalla sin completar la misión
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (!completada && idMision) {
          console.log("Simulación: misión descartada automáticamente:", idMision);
          // Aquí iría el fetch real a /api/misiones/descartar
        }
      };
    }, [completada])
  );

  // Simula el envío de la misión como completada
  const handleSubmit = () => {
    if (!missionResponse && !imageUri) {
      Alert.alert("Misión vacía", "Agrega al menos una respuesta o imagen.");
      return;
    }

    // Aquí iría el fetch real para completar misión
    console.log("Simulación: misión enviada:", {
      idMision,
      respuesta: missionResponse,
      imagen: imageUri,
    });

    setCompletada(true);
    Alert.alert("Simulado", "¡Misión completada!");
    router.replace("../crear"); // Vuelve a la pantalla principal
  };

  // Simula guardar la misión para hacerla más tarde
  const handleSaveForLater = () => {
    console.log("Simulación: misión guardada para más tarde:", idMision);
    setCompletada(true);
    router.replace("../crear");
  };

  // Simula descartar la misión manualmente
  const handleDiscard = () => {
    console.log("Simulación: misión descartada manualmente:", idMision);
    setCompletada(true);
    router.replace("../crear");
  };

  // También descarta la misión si el usuario pulsa volver (flecha atrás)
  const handleBack = () => {
    handleDiscard();
  };

  return (
    <View className="flex-1 bg-[#F4EDE0] px-6 pt-10">
      {/* Botón de volver */}
      <TouchableOpacity onPress={handleBack} className="absolute top-10 left-4 z-10">
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Título de la misión */}
      <Text className="text-black font-bold text-lg mb-4 text-center">
        {titulo ?? "Misión sin título"}
      </Text>

      {/* Descripción de la misión */}
      <Text className="text-black mb-2">
        {descripcion ?? "Descripción no disponible"}
      </Text>

      {/* Campo de texto para responder a la misión */}
      <TextInput
        multiline
        placeholder="Aquí responde a la misión"
        placeholderTextColor="#444"
        value={missionResponse}
        onChangeText={setMissionResponse}
        className="border border-[#699D81] rounded-xl p-4 mb-6 text-black"
        style={{ minHeight: 100 }}
      />

      {/* Imagen cargada o selección de imagen */}
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

        {/* Botones para tomar foto o subir imagen */}
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

      {/* Botones de acción: descartar, enviar, guardar */}
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

