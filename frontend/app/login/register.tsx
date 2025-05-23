import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modoPrueba, setModoPrueba] = useState(false); // Cambiar a false para usar backend
  const { register } = useAuth();
  const router = useRouter();

 

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Campos incompletos", "Por favor rellena todos los campos.");
      return;
    }
  
    // 📧 Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Correo inválido", "Introduce un correo electrónico válido.");
      return;
    }
  
    //  Validación de contraseña segura
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
  
    //  Registro real
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          password: password,
          username:nombreUsuario,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null); 
        Alert.alert("Registro fallido", errorData?.error || "Error desconocido");
        return;
      }
      const data = await res.json();
      await register(data.token, data.userId);
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

      {/* Email */}
      <Text className="text-black font-semibold mb-1">Email:</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Tu email"
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
      />
      <Text className="text-black font-semibold mb-1">Nombre de usuario:</Text>
      <TextInput
        value={nombreUsuario}
        onChangeText={setNombreUsuario}
        placeholder="Ej. ivangallego13"
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
      />
      {/* Contraseña */}
      <Text className="text-black font-semibold mb-1">Contraseña:</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña"
        secureTextEntry
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
      />
      {/* Confirmar contraseña */}
      <Text className="text-black font-semibold mb-1">Repite la contraseña:</Text>
      <TextInput
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Repite tu contraseña"
        secureTextEntry
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
  );
}


