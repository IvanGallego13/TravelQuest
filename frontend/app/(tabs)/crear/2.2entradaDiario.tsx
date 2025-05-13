import { Text, View, TouchableOpacity, TextInput, Image, Alert, ImageBackground, Platform} from "react-native";
import { useState, useCallback} from "react";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUbicacion } from "../../../hooks/useUbicacion";
import { apiFetch } from "../../../lib/api";
import { useFocusEffect } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

export default function CreateJournalEntry(){
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);

  const router = useRouter();
  const { ubicacion } = useUbicacion();
  
  const cityName = ubicacion?.city || "Ciudad desconocida";
  const formattedDate = new Date().toLocaleDateString("en-GB");


  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      console.log("✅ Imagen seleccionada:", uri);
      setImageUri(uri);
    } else {
      console.log("❌ Selección de imagen cancelada");
    }
  };
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
  
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

  const handlePublish = async () => {
    if (!description && !imageUri) {
      Alert.alert("Entrada vacía", "Agrega una descripción o una imagen.");
      return;
    }
    if (!ubicacion?.cityId) {
      Alert.alert("Error", "No se ha detectado una ciudad válida");
      return;
    }

    setLoading(true);
    setNetworkError(false);

    try {
      // Upload image first if present
      let imageUrl = null;
      if (imageUri) {
        try {
          // Get file info
          const uriParts = imageUri.split('.');
          const fileType = uriParts[uriParts.length - 1].toLowerCase();
          const fileName = `photo-${Date.now()}.${fileType}`;
          
          // Create FormData
          const formData = new FormData();
          
          // Add image with proper structure for React Native
          formData.append('image', {
            uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
            type: fileType === 'jpg' || fileType === 'jpeg' ? 'image/jpeg' : `image/${fileType}`,
            name: fileName,
          } as any);
          
          console.log("📸 Enviando imagen...");
          
          // Upload the image with a timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds for image upload
          
          const uploadRes = await fetch(`http://192.168.1.159:3000/api/imagenes/upload`, {
            method: "POST",
            headers: {
              // Don't set Content-Type header for FormData
              "Authorization": `Bearer ${await SecureStore.getItemAsync("travelquest_token")}`,
            },
            body: formData,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (!uploadRes.ok) {
            const errorText = await uploadRes.text();
            console.error("Error del servidor:", errorText);
            throw new Error("Error al subir la imagen");
          }
          
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
          console.log("🖼️ Imagen subida correctamente:", imageUrl);
        } catch (error: any) {
          console.error("❌ Error al subir la imagen:", error);
          
          if (error.name === 'AbortError') {
            Alert.alert(
              "Error de conexión", 
              "La subida de la imagen está tardando demasiado. Comprueba tu conexión a internet e inténtalo de nuevo."
            );
            setNetworkError(true);
          } else {
            Alert.alert("Error", "No se pudo subir la imagen. Intenta de nuevo.");
          }
          
          setLoading(false);
          return;
        }
      }

      // Now create the diary entry with the image URL
      const entryData = {
        description,
        cityId: ubicacion.cityId.toString(),
        travelDate: new Date().toISOString().split("T")[0],
        imageUrl: imageUrl,
      };

      console.log("📝 Enviando entrada de diario:", entryData);

      try {
        const res = await apiFetch("/diarios/create-or-append", {
          method: "POST",
          body: JSON.stringify(entryData),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error del servidor:", errorText);
          throw new Error("Error al guardar la entrada");
        }

        Alert.alert("¡Éxito!", "Tu entrada de diario se ha guardado correctamente.");
        setDescription("");
        setImageUri(null);
        router.replace("../(tabs)/diario");
      } catch (error: any) {
        console.error("❌ Error al publicar:", error);
        
        if (error.name === 'AbortError') {
          Alert.alert(
            "Error de conexión", 
            "La conexión con el servidor está tardando demasiado. Comprueba tu conexión a internet e inténtalo de nuevo."
          );
          setNetworkError(true);
        } else {
          Alert.alert("Error", "No se pudo guardar la entrada. Intenta de nuevo.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/ciudad2.png')} // O la que tú uses
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 px-6 pt-12 justify-start">
        {/* Back button */}
        <TouchableOpacity 
          onPress={() => router.push("/login/localizacion")}
          className="absolute top-10 left-4 z-10 bg-white/70 rounded-full p-2 shadow-md"
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        {/* Ciudad y fecha como badge */}
        <View className="bg-white/80 px-4 py-2 rounded-xl shadow-md self-start mb-6 flex-row items-center gap-2">
          <Text className="text-black text-lg font-semibold">
            {cityName} · {formattedDate}
          </Text>
          <Text className="text-black text-xl">📓</Text>
        </View>

        {/* Área de imagen */}
        <View className="bg-white/80 rounded-2xl shadow-md items-center justify-center p-6 mb-8 py-10">
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
              className="bg-white/90 px-4 py-3 rounded-2xl shadow-md me-3"
              onPress={handleTakePhoto}
            >
              <Text className="text-black font-semibold text-base">Tomar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-white/90 px-4 py-3 rounded-2xl shadow-md"
              onPress={handleImagePick}
            >
              <Text className="text-black font-semibold text-base">Subir imagen</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Área de texto */}
        <View className="bg-white/80 rounded-2xl shadow-md p-4 mb-8">
          <TextInput
            multiline
            numberOfLines={5}
            placeholder="Escribe tu recuerdo..."
            placeholderTextColor="#888"
            value={description}
            onChangeText={setDescription}
            className="text-black text-base"
          />
        </View>

        {/* Botón Publicar */}
        <TouchableOpacity
          onPress={handlePublish}
          disabled={loading}
          className={`px-6 py-4 rounded-2xl shadow-md ${
            loading ? "bg-gray-400" : "bg-white/90"
          }`}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-black font-bold text-lg">
              {loading ? "Publicando..." : "Publicar"}
            </Text>
            <Text className="text-black text-xl">→</Text>
          </View>
        </TouchableOpacity>

      </View>
    </ImageBackground>
  );

  // Add a network error message
  return (
    <ImageBackground
      source={require('../../../assets/images/ciudad2.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 px-6 pt-12 justify-start">
        {/* Show network error message if needed */}
        {networkError && (
          <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <Text className="font-bold">Problema de conexión</Text>
            <Text>Hay problemas para conectar con el servidor. Comprueba tu conexión a internet.</Text>
          </View>
        )}

        {/* Rest of your component UI */}
        {/* ... */}
      </View>
    </ImageBackground>
  );
}