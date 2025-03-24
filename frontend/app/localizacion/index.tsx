// app/localizacion/index.tsx
import { useRouter } from "expo-router";
import { View, Text, Button } from "react-native";

export default function Localizacion() {
  const router = useRouter();

  const irATabs = () => {
    router.replace("/(tabs)");
  };

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-lg font-bold mb-4">Pantalla de geolocalización (simulada)</Text>
      <Button title="Continuar a la app" onPress={irATabs} />
    </View>
  );
}
