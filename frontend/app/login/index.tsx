import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { signInWithGoogle, resetPassword } from "@/lib/auth";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";

export default function Login() {
  const { login } = useAuth(); // se asume que login(token) guarda la sesión
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [modoPrueba, setModoPrueba] = useState(false); // activa/desactiva conexión real
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleLogin = async () => {
    console.log("🔐 Inicio del proceso de login");
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
      console.log("🔑 Iniciando sesión en modo prueba");
      await login("modo_prueba_token"); // Modo prueba
      router.replace("/login/localizacion");
      return;
    }
  
    try {
      console.log("🔐 Iniciando conexión con el servidor...");
      
      // Usamos la ruta sin preocuparnos por /api, la función apiFetch ya lo maneja correctamente
      const endpoint = "/auth/login";
      console.log("🔄 Endpoint a usar:", endpoint);
      
      const res = await apiFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: usuario, // usa "email" para coincidir con el backend
          password,
        }),
      });
  
      console.log("📡 Respuesta recibida, status:", res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Error en respuesta:", errorText);
        // Mostrar el texto del error en una alerta para depuración
        Alert.alert("Error del servidor", `Status: ${res.status}\nRespuesta: ${errorText}`);
        throw new Error(errorText);
      }
  
      console.log("✅ Respuesta OK, procesando datos");
      const data = await res.json();
      console.log("🔑 Token recibido:", data.token ? "Sí" : "No");
      console.log("📄 Respuesta completa:", JSON.stringify(data));
      
      if (!data.token) {
        console.error("⚠️ No se recibió un token en la respuesta del servidor");
        Alert.alert("Error", "El servidor no devolvió un token válido. Datos recibidos: " + JSON.stringify(data));
        return;
      }
      
      await login(data.token, data.userId); // almacena el token recibido
      console.log("🧭 Navegando a localización");
      router.replace("/login/localizacion");
    } catch (err) {
      console.error("❌ Error completo:", err);
      Alert.alert("Error", "No se pudo iniciar sesión");
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      const { session, error } = await signInWithGoogle();
      
      if (error) {
        return;
      }
      
      if (session) {
        await login(session.access_token, session.user.id);
        router.replace("/login/localizacion");
      }
    } catch (error) {
      console.error('Error de inicio de sesión con Google:', error);
      Alert.alert('Error', 'No se pudo iniciar sesión con Google');
    }
  };

  const goToRegister = () => {
    router.push("/login/register");
  };

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      Alert.alert("Email requerido", "Por favor, introduce tu correo electrónico.");
      return;
    }

    setIsLoading(true);
    try {
      const { success, error } = await resetPassword(resetEmail);
      
      if (success) {
        Alert.alert(
          "Correo enviado", 
          "Se ha enviado un enlace para restablecer tu contraseña a tu correo electrónico."
        );
        setShowResetModal(false);
        setResetEmail("");
      } else {
        Alert.alert("Error", error ? (error as any).message || "No se pudo enviar el correo de recuperación" : "No se pudo enviar el correo de recuperación");
      }
    } catch (err) {
      Alert.alert("Error", "Ocurrió un error al procesar tu solicitud");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openResetModal = () => {
    setResetEmail(usuario); // Pre-llenar con el email ya ingresado (si existe)
    setShowResetModal(true);
  };

  // Función para probar la conexión con el backend
  const testBackendConnection = async () => {
    try {
      console.log("🧪 Probando conexión al backend...");
      // Vamos a probar la ruta correcta del API
      const apiURL = process.env.EXPO_PUBLIC_API_URL;
      console.log("URL de API configurada:", apiURL);
      
      // Probar primero la ruta raíz del servidor
      try {
        console.log("Probando ruta raíz");
        const rootResponse = await fetch(apiURL || '');
        
        const rootStatus = rootResponse.status;
        console.log("✅ Respuesta de ruta raíz, status:", rootStatus);
        
        let rootText = '';
        try {
          rootText = await rootResponse.text();
          console.log("Contenido de respuesta raíz:", rootText);
        } catch (e) {
          rootText = "No se pudo leer el contenido";
        }
      } catch (error) {
        console.error("❌ Error al conectar con ruta raíz:", error);
      }
      
      // Probar ahora la ruta de autenticación
      try {
        console.log("Probando ruta de autenticación (usando apiFetch)");
        
        const authResponse = await apiFetch("/auth/login", {
          method: 'POST',
          body: JSON.stringify({
            email: 'test@test.com',
            password: 'password'
          })
        });
        
        const authStatus = authResponse.status;
        console.log("✅ Respuesta de auth:", authStatus);
        
        // Obtener el texto de la respuesta para depuración
        let responseText = '';
        try {
          responseText = await authResponse.text();
          console.log("📄 Contenido de respuesta auth:", responseText);
        } catch (e) {
          responseText = "No se pudo leer el contenido de la respuesta";
        }
        
        if (authStatus === 404) {
          Alert.alert("Error de ruta", `La ruta de autenticación no existe (404)`);
        } else {
          Alert.alert("Conexión exitosa", 
            `El servidor está respondiendo correctamente.\n\nStatus: ${authStatus}`);
        }
      } catch (error) {
        console.error("❌ Error al conectar con auth:", error);
        Alert.alert("Error de conexión", `No se pudo conectar con el endpoint de autenticación`);
      }
    } catch (error) {
      console.error("❌ Error general al probar conexión:", error);
      Alert.alert("Error de conexión", `No se pudo conectar con el backend`);
    }
  };

  // Test para activar modo prueba
  const toggleTestMode = () => {
    setModoPrueba(!modoPrueba);
    Alert.alert(
      modoPrueba ? "Modo prueba desactivado" : "Modo prueba activado",
      modoPrueba ? "Ahora se conectará al servidor real" : "Ahora podrás iniciar sesión sin conectar al servidor"
    );
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
        className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-2 text-black"
      />
      
      {/* Olvidé mi contraseña */}
      <TouchableOpacity onPress={openResetModal} className="mb-4">
        <Text className="text-[#C76F40] font-semibold text-right">¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>

      {/* Botón de login */}
      <TouchableOpacity
        onPress={handleLogin}
        className="bg-[#C76F40] py-3 rounded-xl mb-3 items-center"
      >
        <Text className="text-white font-semibold text-base">
          {modoPrueba ? "Iniciar sesión (Modo prueba)" : "Iniciar sesión"}
        </Text>
      </TouchableOpacity>

      {/* Botón para iniciar sesión con Google */}
      <TouchableOpacity
        onPress={handleGoogleLogin}
        className="bg-white py-3 rounded-xl mb-3 items-center flex-row justify-center border border-gray-300"
      >
        <Image 
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }} 
          style={{ width: 20, height: 20 }} 
          className="mr-2"
        />
        <Text className="text-black font-semibold text-base">Continuar con Google</Text>
      </TouchableOpacity>

      {/* Botón para registrarse */}
      <TouchableOpacity
        onPress={goToRegister}
        className="bg-[#C76F40] py-3 rounded-xl mb-3 items-center"
      >
        <Text className="text-white font-semibold text-base">Registrarse</Text>
      </TouchableOpacity>

      {/* Botones de depuración */}
      <View className="flex-row justify-center mt-4 gap-2">
        <TouchableOpacity
          onPress={testBackendConnection}
          className="bg-gray-500 py-2 px-3 rounded-xl items-center"
        >
          <Text className="text-white text-xs">Probar Conexión</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={toggleTestMode}
          className={`${modoPrueba ? 'bg-green-500' : 'bg-gray-500'} py-2 px-3 rounded-xl items-center`}
        >
          <Text className="text-white text-xs">Modo Prueba</Text>
        </TouchableOpacity>
      </View>

      {/* Modal para resetear contraseña */}
      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-xl w-[90%] max-w-md">
            <Text className="text-black text-xl font-bold mb-4">Recuperar contraseña</Text>
            <Text className="text-black mb-4">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </Text>
            
            <TextInput
              value={resetEmail}
              onChangeText={setResetEmail}
              placeholder="Correo electrónico"
              keyboardType="email-address"
              className="bg-white border-2 border-[#699D81] rounded-md px-4 py-2 mb-4 text-black"
            />
            
            <View className="flex-row gap-2">
              <TouchableOpacity 
                onPress={() => setShowResetModal(false)}
                className="flex-1 py-3 rounded-xl items-center border border-[#C76F40]"
              >
                <Text className="text-[#C76F40] font-semibold">Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handlePasswordReset}
                disabled={isLoading}
                className="flex-1 bg-[#C76F40] py-3 rounded-xl items-center"
              >
                <Text className="text-white font-semibold">
                  {isLoading ? "Enviando..." : "Enviar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

