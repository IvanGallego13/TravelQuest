import { Text, View, TouchableOpacity, TextInput, Image, Alert, ImageBackground} from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUbicacion } from "../../../hooks/useUbicacion";
import { apiFetch } from "../../../lib/api";


export default function CreateJournalEntry(){
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    try {
     
      const formData = new FormData();
      formData.append("description", description);
      formData.append("cityId", ubicacion.cityId.toString());
      formData.append("travelDate", new Date().toISOString().split("T")[0]);

        if (imageUri) {
          const fileName = imageUri.split("/").pop() || `photo-${Date.now()}.jpg`;
        
          const image: any = {
            uri: imageUri,
            name: fileName,
            type: "image/jpeg",
          } as any;
          console.log("📸 Imagen a enviar:", image);
        
          formData.append("image", image);
        }

        // 🧪 Log de todo el formData antes de enviarlo
        for (let [key, value] of formData.entries()) {
          console.log("🧪 FormData:", key, value);
        }
        //termina prueba 
      //console.log("🟡 Publicando entrada de diario con datos:");
      //console.log({ description, cityId: ubicacion.cityId, imageUri });
      /*console.log("🧾 FormData:", {
        description,
        cityId: ubicacion.cityId.toString(),
        travelDate: new Date().toISOString().split("T")[0],
        image: imageUri,
      });*/

      const res = await apiFetch("/diarios/create-or-append", {
        method: "POST",
        body: formData,
      });

      console.log("📬 Estado de la respuesta:", res.status);

      if (!res.ok) throw new Error("Error al guardar la entrada");

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
    <ImageBackground
      source={require('../../../assets/images/ciudad2.png')} // O la que tú uses
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 px-6 pt-12 justify-start">

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
}