
import { useRouter } from "expo-router";// Importamos el hook para navegación entre pantallas
import { useAuth } from "@/hooks/useAuth";// Importamos el hook de autenticación que contiene la lógica de login y register
import { View, Text, TextInput, Alert, Button } from "react-native";// Componentes de React Native
import { useState } from "react";

// Este es el componente principal que representa la pantalla de registro
export default function Register() {
  
  const { register } = useAuth();// Extraemos la función `register` desde el hook de autenticación
  const router = useRouter();// Instancia del router para redireccionar al usuario después del registro

    // Estados para guardar los valores introducidos por el usuario
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

  // Esta función se llama cuando el usuario pulsa el botón de registro
  const handleRegister = async () => {
    await register(); // Simulamos el registro del usuario, y marcamos como autenticado
    router.replace("../localizacion"); // Redirigimos al layout principal tras registrarse
};
  //función para registrar
  /* const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Campos incompletos", "Por favor, completa todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    await register(); // Aquí podrías enviar también `email` y `password` al backend
    router.replace("../localizacion");
  };*/

  

  // Interfaz de usuario para el registro
  return (
    <View className="flex-1 items-center justify-center">
      <Text>Pantalla de Registro</Text>

       {/* Input de Email */}
       <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="border border-gray-300 rounded px-4 py-2 w-full"
      />
        {/* Input de Contraseña */}
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="border border-gray-300 rounded px-4 py-2 w-full"
      />

      {/* Confirmación de contraseña */}
      <TextInput
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        className="border border-gray-300 rounded px-4 py-2 w-full"
      />
      {/* Botón para iniciar el proceso de registro */}
      <Button title="Registrarse" onPress={handleRegister} />
    </View>
  );
}
