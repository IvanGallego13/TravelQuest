import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default function Login() {
  const { login } = useAuth(); // se asume que login(token) guarda la sesión
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [modoPrueba, setModoPrueba] = useState(true); // 🔁 activa/desactiva conexión real

  const handleLogin = async () => {
    if (!usuario || !password) {
      Alert.alert("Campos vacíos", "Debes completar ambos campos.");
      return;
    }

    if (modoPrueba) {
      //MODO PRUEBA SIN BACKEND
      await login(); // usa tu mock de login
      router.replace("../login/localizacion");
      return;
    }

    try {
      const res = await fetch("https://tu-backend.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario, password }),
      });

      if (!res.ok) throw new Error("Credenciales inválidas");

      const data = await res.json();
      await login(data.token); // si tu contexto lo soporta
      router.replace("./localizacion");
    } catch (err) {
      Alert.alert("Error", "No se pudo iniciar sesión");
      console.error(err);
    }
  };

  const goToRegister = () => {
    router.push("/login/register");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-[#F4EDE0] justify-center px-6"
    >
      {/* Logo y título */}
      <View className="flex-row justify-center items-center mb-10">
        <Image
          source={require("@/assets/images/logo.png")}
          className="w-10 h-10 mr-2"
        />
        <Text className="text-2xl font-bold text-black">TravelQuest</Text>
      </View>

      {/* Inputs */}
      <Text className="text-black font-semibold mb-1">Usuario:</Text>
      <TextInput
        value={usuario}
        onChangeText={setUsuario}
        placeholder="Tu usuario"
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
      />

      <Text className="text-black font-semibold mb-1">Contraseña:</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Tu contraseña"
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-6 text-black"
      />

      {/* Botón de login */}
      <TouchableOpacity
        onPress={handleLogin}
        className="bg-[#C76F40] py-3 rounded-xl mb-3 items-center"
      >
        <Text className="text-white font-semibold text-base">Iniciar sesión</Text>
      </TouchableOpacity>

      {/* Botón para registrarse */}
      <TouchableOpacity
        onPress={goToRegister}
        className="bg-[#C76F40] py-3 rounded-xl items-center"
      >
        <Text className="text-white font-semibold text-base">Registrarse</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

