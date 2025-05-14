import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../lib/api";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
} from "react-native";

export default function Login() {
  const { login } = useAuth(); // se asume que login(token) guarda la sesión
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [modoPrueba, setModoPrueba] = useState(false); // activa/desactiva conexión real

  const redirectUri = Linking.createURL("login-callback");
  
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
      await login("modo_prueba_token"); // Modo prueba
      router.replace("/login/localizacion");
      return;
    }
    console.log("📤 Enviando login:", {
      email: usuario,
      password,
    });
    //console.log("🌍 Intentando conectar a:", `${API_URL}/auth/login`);
    
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: usuario, // usa "email" para coincidir con el backend
          password,
        }),
      });
  
      if (!res.ok) throw new Error(await res.text());
  
      // En la función handleLogin, después de recibir la respuesta exitosa:
      const data = await res.json();
      console.log("🔑 Token recibido:", data.token ? "Sí" : "No");
  
      // Asegúrate de que el token se guarda correctamente
      await login(data.token, data.userId);
  
      // Verificar que el token se guardó
      const storedToken = await SecureStore.getItemAsync("travelquest_token");
      console.log("🔑 Token almacenado:", storedToken ? "Sí" : "No");
      router.replace("/login/localizacion");
    } catch (err) {
      Alert.alert("Error", "No se pudo iniciar sesión");
      console.error(err);
    }
  };
  
  /*const handleGoogleLogin = async () => {
    console.log("🔍 Google login: iniciado");
  
    const redirectUri = "https://auth.expo.io/@blancaciv/myApp";
    //AuthSession.makeRedirectUri({ useProxy: true });
  
    console.log("🧭 redirectTo que se enviará a Supabase:", redirectUri);
  
    // Escuchamos el regreso desde el navegador
    const listener = Linking.addEventListener("url", (event) => {
      console.log("🔁 Volvió desde navegador:", event.url);
  
      supabase.auth.getSession().then(({ data }) => {
        console.log("🟢 Sesión detectada:", data.session);
        if (data.session) {
          login(data.session.access_token, data.session.user.id);
          router.replace("/login/localizacion");
        }
      });
  
      WebBrowser.dismissBrowser();
      listener.remove(); // limpia listener
    });
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUri,
      },
    });
  
    if (error) {
      console.error("❌ Error generando login:", error.message);
      return;
    }
  
    console.log("🌍 Abriendo navegador:", data.url);
    await WebBrowser.openBrowserAsync(data.url);
  };
  const handleGoogleLogin = async () => {
    console.log("🔍 Google login: iniciado");
  
    const redirectUri = Linking.createURL("login-callback");
    console.log("🧭 redirectTo que se enviará a Supabase:", redirectUri);
  
    // Escuchamos el regreso desde el navegador
    const listener = Linking.addEventListener("url", async (event) => {
      console.log("📥 Evento recibido:", event.url);
    
      const url = new URL(event.url);
      const code = url.searchParams.get("code");
    
      if (!code) {
        console.error("❌ No se encontró el parámetro 'code' en el URL");
        return;
      }
    
      console.log("📨 Código recibido:", code);
    
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  
      if (error) {
        console.error("❌ Error obteniendo sesión:", error.message);
      } else if (data.session) {
        console.log("🟢 Sesión obtenida:", data.session);
        login(data.session.access_token, data.session.user.id);
        router.replace("/login/localizacion");
      }
  
      WebBrowser.dismissBrowser();
      listener.remove();
    });
  
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUri,
      },
    });
  
    if (error) {
      console.error("❌ Error generando login:", error.message);
      return;
    }
  
    console.log("🌍 Abriendo navegador:", data.url);
    await WebBrowser.openBrowserAsync(data.url);
  };*/
  const handleGoogleLogin = async () => {
    console.log("🔍 Google login: iniciado");
  
    const redirectUri = Linking.createURL("login-callback");
    console.log("🧭 redirectTo que se enviará a Supabase:", redirectUri);
  
    // Escuchamos el regreso desde el navegador
    const listener = Linking.addEventListener("url", async (event) => {
      console.log("📥 Evento recibido:", event.url);
  
      const url = new URL(event.url);
      const code = url.searchParams.get("code");
  
      if (!code) {
        console.error("❌ No se encontró el parámetro 'code' en el URL");
        return;
      }
  
      console.log("📨 Código recibido:", code);
  
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  
      if (error) {
        console.error("❌ Error obteniendo sesión:", error.message);
        return;
      }
  
      const session = data.session;
      if (session) {
        const { user } = session;
        console.log("🟢 Sesión obtenida:", session);
        await login(session.access_token, user.id); // guardar sesión
  
        // Comprobar si ya tiene profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .single();
  
        if (profileError || !profileData) {
          console.log("🆕 Creando nuevo perfil para el usuario...");
  
          const { error: insertError } = await supabase
            .from("profiles")
            .insert({
              id: user.id,
              username: user.user_metadata?.full_name || user.email,
              avatar: user.user_metadata?.avatar_url || null,
              score: 0,
            });
  
          if (insertError) {
            console.error("❌ Error creando el perfil:", insertError.message);
          } else {
            console.log("✅ Perfil creado correctamente.");
          }
        } else {
          console.log("🔁 Perfil ya existente.");
        }
  
        router.replace("/login/localizacion");
      }
  
      WebBrowser.dismissBrowser();
      listener.remove();
    });
  
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUri,
      },
    });
  
    if (error) {
      console.error("❌ Error generando login:", error.message);
      return;
    }
  
    console.log("🌍 Abriendo navegador:", data.url);
    await WebBrowser.openBrowserAsync(data.url);
  };
  
  
  const goToRegister = () => {
    router.push("/login/register");
  };

  return (
    <ImageBackground
      source={require('../../assets/images/fondo.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 bg-white/20 px-6 justify-center pb-20 "
      >
        {/* Contenedor central de login */}
        <View className="bg-white/80 p-6 rounded-2xl shadow-md">
          
          {/* Título */}
          <View className="items-center mb-8">
            <Text className="text-2xl font-bold text-black">TravelQuest</Text>
          </View>

          {/* Input Usuario */}
          <Text className="text-black text-lg font-semibold mb-1">Usuario:</Text>
          <TextInput
            value={usuario}
            onChangeText={setUsuario}
            placeholder="Tu usuario"
            placeholderTextColor="#999"
            className="bg-white border border-gray-300 rounded-xl px-4 py-3 mb-4 text-black"
          />

          {/* Input Contraseña */}
          <Text className="text-black text-lg font-semibold mb-1">Contraseña:</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Tu contraseña"
            placeholderTextColor="#999"
            className="bg-white border border-gray-300 rounded-xl px-4 py-3 mb-6 text-black"
          />

          {/* Botón Iniciar sesión */}
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-white/90 px-6 py-4 rounded-2xl shadow-md mb-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-black text-xl">🔓</Text>
              <Text className="text-black font-bold text-lg">Iniciar sesión</Text>
              <Text className="text-black text-xl">→</Text>
            </View>
          </TouchableOpacity>

          {/* Botón Registrarse */}
          <TouchableOpacity
            onPress={goToRegister}
            className="bg-white/90 px-6 py-4 rounded-2xl shadow-md mb-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-black text-xl">📝</Text>
              <Text className="text-black font-bold text-lg">Registrarse</Text>
              <Text className="text-black text-xl">→</Text>
            </View>
          </TouchableOpacity>

          {/* Botón Google (comentado por ahora) */}
          {/*
          <TouchableOpacity
            onPress={handleGoogleLogin}
            className="bg-white border border-[#C76F40] px-6 py-4 rounded-2xl shadow-md"
          >
            <Text className="text-[#C76F40] font-semibold text-center">Iniciar sesión con Google</Text>
          </TouchableOpacity>
          */}
          
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

