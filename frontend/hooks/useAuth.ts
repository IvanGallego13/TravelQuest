import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useAuthStore } from "@/store/auth";

const TOKEN_KEY = "travelquest_token";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Al iniciar la app, verificamos si hay un token guardado
  useEffect(() => {
    const checkToken = async () => {
      if (Platform.OS === "web") {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      setIsLoggedIn(!!token);
      setLoading(false);
    };

    checkToken();
  }, []);

  // Función de login real
  const login = async (token?: string, userId?: string) => {
    console.log("🔐 Ejecutando función login en useAuth");
    if (token) {
      console.log("💾 Guardando token en SecureStore");
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        console.log("✅ Token guardado correctamente");
      } catch (error) {
        console.error("❌ Error al guardar token:", error);
      }
    }
    if(userId){
      console.log("👤 Guardando userId:", userId);
      useAuthStore.getState().setUserId(userId);
    }
    setIsLoggedIn(true);
    console.log("✅ Estado de login actualizado a true");
  };

  // Función de registro real 
  const register = async (token?: string, userId?: string) => {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
    if (userId) {
      useAuthStore.getState().setUserId(userId);
    }  
    setIsLoggedIn(true);
  };

  // Cierra sesión y elimina token
  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    useAuthStore.getState().clearUser();
    setIsLoggedIn(false);
  };

  return {
    isLoggedIn,
    loading,
    login,
    logout,
    register,
  };
}



