import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert, ImageBackground} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation  } from "@react-navigation/native";
import { apiFetch } from "../../../lib/api"; 
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";


export default function Mision() {
  const router = useRouter();
  const { missionId, title, description, difficulty} = useLocalSearchParams();
  const numericMissionId = Number(missionId);
  const navigation = useNavigation();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [completada, setCompletada] = useState(false);
  const estadoEnviadoRef = useRef<"none" | "completed" | "accepted" | "discarded">("none");
  
  const [yaActualizada, setYaActualizada] = useState(false);


  // Limpiar estado al cargar nueva misión
  useEffect(() => {
    setImageUri(null);
    setCompletada(false);
    estadoEnviadoRef.current = "none";
  }, [missionId]);

  const sendToBackend = async (status: "completed" | "accepted" | "discarded") => {
    try {
      const body: any = {
        status,
      };

      if (status === "completed") {
        body.completed_at = new Date().toISOString();
        body.image_url = imageUri;
      }
      console.log("📍 missionId a enviar:", numericMissionId);

      const res = await apiFetch(`/misiones/usuario/${numericMissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Error actualizando misión");

      estadoEnviadoRef.current = status;
      console.log(`✅ Estado enviado: ${status}`);

      if (status === "completed") {
      router.push({
        pathname: "/misiones/completadaMision",
        params: {
          missionId: numericMissionId.toString(),
          difficulty: difficulty?.toString(),
        },
      });
    } else {
      router.replace("/(tabs)/crear");
    }
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
      sendToBackend("completed");
    } catch (error) {
      console.error("Error en validación de imagen", error);
      Alert.alert("Error", "No se pudo validar la imagen.");
    }
  };
    //setEstadoManual("completed");
    //sendToBackend("completed");
  

  const handleSaveForLater = () => {
    sendToBackend("accepted");
  };

  const handleDiscard = () => {;
    sendToBackend("discarded");
  };

  const handleBack = () => {
    handleDiscard();
  };

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (estadoEnviadoRef.current === "none") {
          console.log("🧹 Cleanup: ejecutando discard porque no se completó ni se guardó.");
          handleDiscard();
        }
      };
    }, [])
  );
  
  

useEffect(() => {
  const unsubscribe = navigation.addListener("beforeRemove", (event) => {
    if (estadoEnviadoRef.current !== "none") return;

    event.preventDefault();

    Alert.alert(
      "¿Descartar misión?",
      "Si sales ahora, la misión se marcará como descartada.",
      [
        { text: "Cancelar", style: "cancel", onPress: () => {} },
        {
          text: "Descartar y salir",
          style: "destructive",
          onPress: () => {
            sendToBackend("discarded");
            navigation.dispatch(event.data.action); // Continúa navegación
          },
        },
      ]
    );
  });

  return unsubscribe;
}, [navigation]);


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
    <ImageBackground
      source={require('../../../assets/images/catedral.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 bg-white/20 pt-10">
        
        {/* Botón volver */}
        <TouchableOpacity
          onPress={handleBack}
          className="absolute top-10 left-4 z-10 bg-white/70 rounded-full p-2 shadow-md"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <ScrollView className="flex-1 px-6">

          {/* Etiqueta de categoría 
          <View className="bg-white/80 px-3 py-1 rounded-full self-start mt-16 mb-2 shadow-sm">
            <Text className="text-xs font-semibold text-black/60">Exploración urbana</Text>
          </View>*/}

          {/* Título de misión */}
          <View className="bg-white/80 p-4 mt-18 rounded-2xl shadow-md mb-4">
            <Text className="text-black font-bold text-xl text-center">
              🕵️‍♂️ {title ?? "Misión sin título"}
            </Text>
          </View>

          {/* Descripción */}
          <View className="bg-white/80 p-4 rounded-2xl shadow-md mb-10">
            <Text className="text-black text-base leading-relaxed">
              {description ?? "Descripción no disponible"}
            </Text>
          </View>

          {/* Área de imagen / carga */}
          <View className="bg-white/80 rounded-2xl shadow-xl items-center justify-center p-6 mb-10">
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 120, height: 120, marginBottom: 10, borderRadius: 12 }}
              />
            ) : (
              <Text className="text-4xl mb-4">📸</Text>
            )}

              

            <View className="flex-row space-x-4">
              <TouchableOpacity
                className="bg-white/90 px-4 py-3 rounded-2xl shadow-md me-2"
                onPress={handleTakePhoto}
              >
                <Text className="text-black font-semibold text-base">Tomar foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="bg-white/90 px-4 py-3 rounded-2xl shadow-md"
                onPress={handlePickImage}
              >
                <Text className="text-black font-semibold text-base">Subir imagen</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Acciones finales */}
          <View className="flex-col space-y-6 pb-10">
            <TouchableOpacity
              className="bg-white/80 px-6 py-4 rounded-2xl shadow-md mb-3"
              onPress={handleDiscard}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-black font-bold text-lg">❌ Descartar misión</Text>
                <Text className="text-black text-xl">→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/80 px-6 py-4 rounded-2xl shadow-md mb-3"
              onPress={handleSubmit}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-black font-bold text-lg">✅ Enviar</Text>
                <Text className="text-black text-xl">→</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/80 px-6 py-4 rounded-2xl shadow-md"
              onPress={handleSaveForLater}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-black font-bold text-lg">💾 Guardar para más tarde</Text>
                <Text className="text-black text-xl">→</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

