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
  StyleSheet,
} from "react-native";
import * as WebBrowser from 'expo-web-browser';
import { AntDesign } from '@expo/vector-icons';
import { initiateOAuth } from "@/lib/socialAuth";

export default function Login() {
  const { login } = useAuth(); // se asume que login(token) guarda la sesión
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [modoPrueba, setModoPrueba] = useState(false); // activa/desactiva conexión real
  
  const handleLogin = async () => {
    if (!usuario.trim() && !password.trim()) {
      Alert.alert("Campos vacíos", "Debes ingresar tu correo y contraseña.");
      return;
    }
    if (!usuario.trim()) {
      Alert.alert("Correo requerido", "Por favor, introduce tu correo electrónico.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Contraseña requerida", "Por favor, introduce tu contraseña.");
      return;
    }
  
    if (modoPrueba) {
      await login(); // Modo prueba
      router.replace("/login/localizacion");
      return;
    }
  
    try {
      const res = await apiFetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: usuario, // usa "email" para coincidir con el backend
          password,
        }),
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
      }
  
      const data = await res.json();
      await login(data.token); // almacena el token recibido
      router.replace("./localizacion");
    } catch (err) {
      Alert.alert("Error", "No se pudo iniciar sesión");
      console.error(err);
    }
  };
  
  const handleSocialLogin = async (provider: 'Google') => {
    try {
      if (modoPrueba) {
        Alert.alert("Modo Prueba", `Iniciando sesión con ${provider} en modo prueba.`);
        await login(); // Modo prueba
        router.replace("/login/localizacion");
        return;
      }

      // Mostrar indicador de carga
      Alert.alert("Conectando", `Iniciando sesión con ${provider}...`);
      
      // Iniciar el proceso OAuth con el proveedor correspondiente
      const token = await initiateOAuth(provider.toLowerCase() as 'google');
      
      if (token) {
        // Si se obtuvo un token, establecer la sesión y redirigir
        await login(token);
        router.replace("/login/localizacion");
      } else {
        // Si no se obtuvo un token, mostrar error
        Alert.alert("Error", `No se pudo completar el inicio de sesión con ${provider}`);
      }
    } catch (error: any) {
      console.error(`Error al iniciar sesión con ${provider}:`, error);
      Alert.alert("Error", `No se pudo iniciar sesión con ${provider}: ${error.message || 'Error desconocido'}`);
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

      {/* Separador */}
      <View className="flex-row items-center my-4">
        <View className="flex-1 h-0.5 bg-gray-300" />
        <Text className="mx-4 text-gray-500">O continuar con</Text>
        <View className="flex-1 h-0.5 bg-gray-300" />
      </View>

      {/* Botones de inicio de sesión social */}
      <TouchableOpacity
        onPress={() => handleSocialLogin('Google')}
        className="bg-white py-3 rounded-xl mb-4 items-center flex-row justify-center"
        style={styles.socialButton}
      >
        <AntDesign name="google" size={20} color="#DB4437" />
        <Text className="text-black font-semibold text-base ml-2">Google</Text>
      </TouchableOpacity>

      {/* Botón para registrarse */}
      <TouchableOpacity
        onPress={goToRegister}
        className="bg-[#C76F40] py-3 rounded-xl items-center mt-2"
      >
        <Text className="text-white font-semibold text-base">Registrarse</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  socialButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  }
});

