// Importa el hook `useRouter` que permite hacer redirecciones entre pantallas
import { useRouter } from "expo-router";

// Importa el hook `useAuth`, donde gestionas el login, logout y estado de autenticación del usuario
import { useAuth } from "@/hooks/useAuth";

// Componentes básicos de React Native para crear la interfaz
import { View, Button, Text } from "react-native";

// Componente principal que representa la pantalla de Login
export default function Login() {
  // Extraemos la función login del hook personalizado de autenticación
  const { login } = useAuth();

  // Creamos una instancia del router para poder redirigir manualmente a otras pantallas
  const router = useRouter();

  // Esta función se ejecuta cuando el usuario hace clic en el botón "Iniciar sesión"
  const handleLogin = async () => {
    await login(); // Llama a la función `login` para iniciar sesión (puede guardar token, actualizar estado, etc.)
    router.replace("./localizacion"); // Una vez logueado, redirige al layout principal que contiene las pestañas
  };
  // Esta función se ejecuta cuando el usuario quiere registrarse
  const goToRegister = () => {
    router.push("/login/register"); // Navega a la pantalla de registro
  };

  // Renderiza la interfaz de usuario de la pantalla Login
  return (
    <View className="flex-1 items-center justify-center  bg-yellow-200 min-h-screen">
      
      <Text>Login Screen</Text>

      {/* Botón que dispara el proceso de login */}
      <Button title="Iniciar sesión" onPress={handleLogin} />
      {/* Botón para ir a la pantalla de registro */}
      <Button title="Crear cuenta" onPress={goToRegister} />
    </View>
  );
}
