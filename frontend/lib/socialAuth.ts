import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { apiFetch } from './api';

// Esta función se utilizará para iniciar el proceso de OAuth
export const initiateOAuth = async (provider: 'google') => {
  try {
    // Solicitar URL de autenticación al backend
    const response = await apiFetch(`/api/auth/${provider}/authorize`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error al iniciar autenticación con ${provider}: ${errorText}`);
    }
    
    const { authUrl } = await response.json();
    
    // Abre el navegador para autenticación
    const result = await WebBrowser.openAuthSessionAsync(authUrl);
    
    if (result.type === 'success') {
      // La URL de redirección incluirá información sobre la sesión
      // Supabase maneja la autenticación automáticamente
      
      // Verificar que se haya establecido una sesión en el backend
      const verificationResponse = await apiFetch('/api/auth/oauth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: 'supabase-oauth-verification' // Este código es solo para verificación
        }),
      });
      
      if (!verificationResponse.ok) {
        const errorText = await verificationResponse.text();
        throw new Error(`Error al verificar autenticación: ${errorText}`);
      }
      
      // Obtener el token JWT
      const { token } = await verificationResponse.json();
      return token;
    }
    
    return null;
  } catch (error) {
    console.error(`Error en initiateOAuth(${provider}):`, error);
    throw error;
  }
}; 