import { supabase } from './supabase';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';

// Obtiene la URL de redirección basada en el entorno
const getRedirectUrl = () => {
  // Si estamos en desarrollo
  if (__DEV__) {
    // Las URLs de redirección para Expo en desarrollo
    const localHost = Platform.OS === 'android' 
      ? 'exp://192.168.1.47:8081' 
      : 'exp://localhost:8081';
    
    return localHost;
  }

  // Si estamos en producción, usar la URL de tu aplicación
  // Usando el esquema definido en app.config.js
  return 'myapp://'; 
};

// Función para iniciar sesión con Google
export const signInWithGoogle = async () => {
  try {
    const redirectUrl = getRedirectUrl();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      }
    });
    
    if (error) {
      Alert.alert("Error", "No se pudo iniciar sesión con Google");
      console.error(error);
      return { session: null, error };
    }
    
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );
      
      if (result.type === 'success') {
        // Después de la redirección exitosa, obtenemos la sesión
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error al obtener la sesión:', sessionError);
          return { session: null, error: sessionError };
        }
        
        return { session, error: null };
      } else {
        return { session: null, error: new Error('El usuario canceló el inicio de sesión con Google') };
      }
    }
    
    return { session: null, error: new Error('URL de autenticación no disponible') };
  } catch (error) {
    console.error('Error de inicio de sesión con Google:', error);
    return { session: null, error };
  }
};

// Función para cerrar sesión
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    return { error };
  }
};

// Función para solicitar restablecimiento de contraseña
export const resetPassword = async (email: string) => {
  try {
    // Obtener URL de redirección basada en el entorno
    const redirectUrl = getRedirectUrl();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    
    if (error) {
      console.error('Error al solicitar restablecimiento de contraseña:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error al solicitar restablecimiento de contraseña:', error);
    return { success: false, error };
  }
}; 