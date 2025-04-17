import { Text, View, TouchableOpacity, TextInput, Image, Alert } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useUbicacion } from "@/hooks/useUbicacion";
import { apiFetch } from "@/lib/api";


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
    <View className="flex-1 bg-[#F4EDE0] px-6 pt-10">
      <Text className="text-black font-bold text-lg mb-4">
        {`${cityName} · ${formattedDate}`}
      </Text>
        <View className="bg-gray-200 rounded-xl items-center justify-center p-6 mb-6">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 120, height: 120, marginBottom: 10, borderRadius: 10 }}
            />
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
              onPress={handleImagePick}
            >
              <Text className="text-white text-sm">Subir imagen</Text>
            </TouchableOpacity>
          </View>
        </View>
      

      <TextInput
        multiline
        numberOfLines={4}
        placeholder="Texto para descripción opcional"
        placeholderTextColor="#999"
        value={description}
        onChangeText={setDescription}
        className="bg-white border-[2px] border-[#699D81] rounded-xl p-4 mb-6 text-black"
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
