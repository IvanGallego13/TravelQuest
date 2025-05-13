import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '../store/auth';

// Constants
const TOKEN_KEY = 'travelquest_token';
const USER_ID_KEY = 'travelquest_user_id';

export function useAuth() {
  const { setIsLoggedIn, setUserId } = useAuthStore();

  // Login function that stores token and userId
  const login = async (token: string, userId?: string) => {
    try {
      console.log("🔐 Guardando token en SecureStore...");
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      
      if (userId) {
        console.log("👤 Guardando userId en SecureStore...");
        await SecureStore.setItemAsync(USER_ID_KEY, userId);
        setUserId(userId);
      }
      
      // Verify token was stored
      const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
      console.log("✅ Token guardado correctamente:", !!storedToken);
      
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error("❌ Error guardando token:", error);
      return false;
    }
  };

  // Register function - essentially the same as login but with a different name for clarity
  const register = async (token?: string, userId?: string) => {
    try {
      if (token) {
        console.log("🔐 Guardando token de registro en SecureStore...");
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      }
      
      if (userId) {
        console.log("👤 Guardando userId de registro en SecureStore...");
        await SecureStore.setItemAsync(USER_ID_KEY, userId);
        setUserId(userId);
      }
      
      setIsLoggedIn(true);
      return true;
    } catch (error) {
      console.error("❌ Error guardando datos de registro:", error);
      return false;
    }
  };

  // Logout function that clears token
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_ID_KEY);
      setIsLoggedIn(false);
      setUserId(null);
      return true;
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      return false;
    }
  };

  // Check if user is logged in
  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const userId = await SecureStore.getItemAsync(USER_ID_KEY);
      
      if (token) {
        console.log("🔑 Token encontrado en inicio");
        setIsLoggedIn(true);
        if (userId) {
          setUserId(userId);
        }
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      return false;
    }
  };

  return { login, register, logout, checkAuth };
}
