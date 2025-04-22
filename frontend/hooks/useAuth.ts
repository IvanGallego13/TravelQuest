import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useAuthStore } from "../store/auth";

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
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
    if(userId){
      useAuthStore.getState().setUserId(userId);
    }
    setIsLoggedIn(true);
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



