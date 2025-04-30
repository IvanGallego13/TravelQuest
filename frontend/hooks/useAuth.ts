/*import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useAuthStore } from "../store/auth";
import { supabase } from "../lib/supabase";

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
}*/
import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { useAuthStore } from "../store/auth";
import { supabase } from "../lib/supabase"; // asegúrate de usar el cliente real

const TOKEN_KEY = "travelquest_token";

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkInitialSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      const token = session?.access_token;

      if (token && session?.user?.id) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        useAuthStore.getState().setUserId(session.user.id);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }

      setLoading(false);
    };

    checkInitialSession();

    // Escuchar cambios de sesión (para Google login o logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.access_token && session.user?.id) {
        SecureStore.setItemAsync(TOKEN_KEY, session.access_token);
        useAuthStore.getState().setUserId(session.user.id);
        setIsLoggedIn(true);
      } else {
        SecureStore.deleteItemAsync(TOKEN_KEY);
        useAuthStore.getState().clearUser();
        setIsLoggedIn(false);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (token?: string, userId?: string) => {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
    if (userId) {
      useAuthStore.getState().setUserId(userId);
    }
    setIsLoggedIn(true);
  };

  const register = async (token?: string, userId?: string) => {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    }
    if (userId) {
      useAuthStore.getState().setUserId(userId);
    }
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    useAuthStore.getState().clearUser();
    await supabase.auth.signOut();
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
