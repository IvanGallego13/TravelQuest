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
  
  console.log("🌐 Llamando a:", url); 
  console.log("📦 Datos enviados:", options.body ? 
    (typeof options.body === 'string' ? options.body.substring(0, 100) + "..." : "FormData") 
    : "Sin datos");
  
  try {
    // Agregamos un timeout de 15 segundos para evitar que se quede esperando indefinidamente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos
    
    const fetchOptions = {
      ...options,
      headers: {
        ...headers,
        ...(options.headers instanceof Headers ? {} : options.headers as Record<string, string>)
      },
      signal: controller.signal
    };
    
    console.log("⏱️ Iniciando petición con timeout de 15 segundos");
    const res = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    console.log("✅ Respuesta recibida con estatus:", res.status);
    
    return res;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error("⌛ Error: La petición tomó demasiado tiempo y fue cancelada");
    } else {
      console.error("❌ Error al llamar a la API:", error);
    }
    throw error;
  }
}

