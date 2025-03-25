import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";

export default function Mision() {
  const router = useRouter();

  // Estado para guardar el texto de la respuesta
  const [missionResponse, setMissionResponse] = useState("");

  // Estado para imagen seleccionada
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Simula descartar misión y generar una nueva
  const handleDiscard = () => {
    // Aquí podrías limpiar campos, generar nueva misión, etc.
    setMissionResponse("");
    setImageUri(null);
    router.replace("../crear");
  };

  //Simula guardar la misión para más tarde
  const handleSaveForLater = () => {
    // Aquí guardarías la misión localmente o en la base de datos
    router.replace("../crear");
  };

  //Simula enviar la misión completada
  const handleSubmit = () => {
    // Aquí podrías hacer una petición POST para guardar la misión
    console.log("Enviando misión:", missionResponse, imageUri);
    router.push("../crear");
  };

  //Simula seleccionar una imagen de la galería
  const handlePickImage = async () => {
    // Aquí iría el código para abrir la galería con ImagePicker
    console.log("Seleccionar imagen desde galería");
  };

  //Simula tomar una foto con la cámara
  const handleTakePhoto = async () => {
    // Aquí iría el código para abrir la cámara
    console.log("Tomar foto con cámara");
  };

  return (
    <View className="flex-1 bg-[#F4EDE0] p-4">
      {/* Encabezado */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-black font-semibold text-lg">
          Astronauta en Salamanca
        </Text>
        <Text className="text-black text-sm">Crear.1.1{"\n"}Misión</Text>
      </View>

      {/* Descripción */}
      <Text className="text-black mb-2">Texto en el cual se describe la misión</Text>

      {/* Input controlado */}
      <TextInput
        multiline
        placeholder="Aquí responde a la misión"
        placeholderTextColor="#444"
        value={missionResponse}
        onChangeText={setMissionResponse}
        className="border border-[#699D81] rounded-md p-3 mb-4 text-black"
        style={{ minHeight: 100 }}
      />

      {/* Imagen + botones para foto o galería */}
      <View className="bg-gray-200 rounded-md items-center justify-center p-6 mb-6">
        {/* Muestra imagen si se ha seleccionado */}
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: 120, height: 120, marginBottom: 10 }}
          />
        ) : (
          <Image
            source={require("@/assets/images/icon.png")} // Puedes poner un ícono de cámara
            style={{ width: 40, height: 40, marginBottom: 10 }}
          />
        )}

        <Text className="text-gray-600 text-center mb-2">
          Al pulsar, opción de hacer foto o subirla
        </Text>

        {/* Botones simulados */}
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

      {/* Botones finales */}
      <View className="flex-row flex-wrap justify-between gap-2">
        <TouchableOpacity
          className="bg-[#699D81] px-4 py-3 rounded-md"
          onPress={handleDiscard}
        >
          <Text className="text-white font-semibold text-center">
            Descartar misión
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#C76F40] px-4 py-3 rounded-md"
          onPress={handleSubmit}
        >
          <Text className="text-white font-semibold text-center">Enviar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-[#699D81] px-4 py-3 rounded-md w-full"
          onPress={handleSaveForLater}
        >
          <Text className="text-white font-semibold text-center">
            Guardar para más tarde
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
