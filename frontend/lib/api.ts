import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_URL}${endpoint}`;
  const token = await SecureStore.getItemAsync("travelquest_token");

  const headers: Record<string, string> = {};
   // Añadir token si existe
   if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 👉 Solo añadir Content-Type si no estás enviando FormData
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
  console.log("🌐 Llamando a:", url); // 👈 LOG DE DEPURACIÓN
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers instanceof Headers ? {} : options.headers as Record<string, string>)
      },
    });

    return res;
  } catch (error) {
    console.error("Error al llamar a la API:", error);
    throw error;
  }
}

