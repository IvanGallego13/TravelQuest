import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";

// Obtener la URL base de la API desde las variables de entorno o usar un valor por defecto
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.159:3000/api";

// Clave para almacenar el token
const TOKEN_KEY = "travelquest_token";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_URL}${endpoint}`;
  const token = await SecureStore.getItemAsync("travelquest_token");

  // Mejorar el logging para depuración
  console.log(`🌐 Llamando a: ${url}`);
  console.log(`🔑 Token disponible: ${token ? 'Sí' : 'No'}`);
  if (token) {
    console.log(`🔑 Token value: ${token.substring(0, 10)}...`);
  } else {
    console.warn(`⚠️ No hay token disponible para la petición: ${endpoint}`);
  }

  const headers: Record<string, string> = {};
  
  // Añadir token si existe
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Solo añadir Content-Type si no estás enviando FormData
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers instanceof Headers ? {} : options.headers as Record<string, string>)
      },
    });

    console.log(`📥 Respuesta de ${endpoint}: ${res.status}`);
    
    // Log para depuración en caso de error
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ Error en ${endpoint}: ${res.status} - ${errorText}`);
      // Clonar la respuesta ya que se ha consumido el body
      return new Response(errorText, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers
      });
    }

    return res;
  } catch (error) {
    console.error(`❌ Error al llamar a la API: ${error}`);
    throw error;
  }
}

