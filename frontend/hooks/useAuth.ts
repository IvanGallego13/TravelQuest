import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

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

  // ✅ Función de login real
  const login = async (token?: string) => {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
    setIsLoggedIn(true);
  };

  // ✅ Función de registro real (misma lógica que login)
  const register = async (token?: string) => {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
    setIsLoggedIn(true);
  };

  // ✅ Cierra sesión y elimina token
  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
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



