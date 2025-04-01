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

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modoPrueba, setModoPrueba] = useState(true); // Cambiar a false para usar backend
  const { register } = useAuth();
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modoPrueba, setModoPrueba] = useState(true); // Cambiar a false para usar backend

  const handleRegister = async () => {
    if (!usuario || !password || !confirmPassword) {
      Alert.alert("Campos incompletos", "Por favor rellena todos los campos.");
      return;
    }
  
    // 📧 Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(usuario)) {
      Alert.alert("Correo inválido", "Introduce un correo electrónico válido.");
      return;
    }
  
    // 🔐 Validación de contraseña segura
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Contraseña débil",
        "Debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo especial (como ! @ # $ % & * ?)."
      );
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert("Contraseña", "Las contraseñas no coinciden.");
      return;
    }
  
    if (modoPrueba) {
      await register(); // Modo simulación
      router.replace("./localizacion");
      return;
    }
  
    // 🔁 Registro real (futuro)
    try {
      const res = await fetch("https://tu-backend.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
      });
  
      if (!res.ok) throw new Error("Error en el registro");
  
      const data = await res.json();
      await register(data.token);
      router.replace("../login/localizacion");
    } catch (error) {
      Alert.alert("Error", "No se pudo completar el registro");
      console.error(error);
    }
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

      {/* Usuario */}
      <Text className="text-black font-semibold mb-1">Usuario:</Text>
      <TextInput
        value={usuario}
        onChangeText={setUsuario}
        placeholder="Tu usuario"
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
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

      {/* Usuario */}
      <Text className="text-black font-semibold mb-1">Usuario:</Text>
      <TextInput
        value={usuario}
        onChangeText={setUsuario}
        placeholder="Tu usuario"
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
      />

      {/* Contraseña */}
      <Text className="text-black font-semibold mb-1">Contraseña:</Text>

      {/* Contraseña */}
      <Text className="text-black font-semibold mb-1">Contraseña:</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña"
        placeholder="Contraseña"
        secureTextEntry
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
      />

      {/* Confirmar contraseña */}
      <Text className="text-black font-semibold mb-1">Repite la contraseña:</Text>
      {/* Confirmar contraseña */}
      <Text className="text-black font-semibold mb-1">Repite la contraseña:</Text>
      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Repite tu contraseña"
        placeholder="Repite tu contraseña"
        secureTextEntry
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-6 text-black"
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-6 text-black"
      />

      {/* Botón de registro */}
      <TouchableOpacity
        onPress={handleRegister}
        className="bg-[#C76F40] py-3 rounded-xl items-center"
      >
        <Text className="text-white font-semibold text-base">Registrarse</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>

      {/* Botón de registro */}
      <TouchableOpacity
        onPress={handleRegister}
        className="bg-[#C76F40] py-3 rounded-xl items-center"
      >
        <Text className="text-white font-semibold text-base">Registrarse</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}


