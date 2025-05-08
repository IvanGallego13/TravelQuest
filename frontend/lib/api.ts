import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

// Obtener la URL base de la API desde las variables de entorno o usar un valor por defecto
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.159:3000/api";

// Clave para almacenar el token
const TOKEN_KEY = "travelquest_token";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  console.log("🌐 Llamando a:", url);

  // Configurar los headers por defecto con tipo correcto
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  try {
    // Get token directly from SecureStore for each request
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    
    // Depuración: Verificar si el token existe
    console.log("🔑 Token disponible:", token ? "Sí" : "No");
    console.log("🔑 Token value:", token ? token.substring(0, 10) + "..." : "None");
    
    // Si hay un token, añadirlo a los headers
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No hay token disponible para la petición:", endpoint);
    }

    // Realizar la petición
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Depuración: Verificar el estado de la respuesta
    console.log(`📥 Respuesta de ${endpoint}: ${response.status}`);
    
    // Si la respuesta no es exitosa, mostrar más información
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error en ${endpoint}: ${response.status} - ${errorText}`);
    }

    return response;
  } catch (error) {
    console.error(`❌ Error en fetch a ${endpoint}:`, error);
    throw error;
  }
}

