//boton de logout , pendiente de ver como implementar desplegable de ajustes
import { useAuth } from "@/hooks/useAuth";
import { View, Text, TouchableOpacity, Alert } from "react-native";

export default function Ajustes() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Cerrar sesión", "¿Seguro que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sí, salir",
        style: "destructive",
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#F4EDE0] px-6">
      <Text className="text-xl font-bold text-black mb-6">Ajustes</Text>

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-[#C76F40] px-6 py-3 rounded-xl"
      >
        <Text className="text-white text-base font-semibold">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
