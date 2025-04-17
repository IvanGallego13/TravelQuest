import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  // Verificar si la URL base ya termina en /api
  let url = '';
  if (!API_URL) {
    console.error("❌ Error: API_URL no está definida en las variables de entorno");
    throw new Error("API_URL no está definida");
  }
  
  // ⚠️ NUEVA SOLUCIÓN: Eliminar cualquier duplicación de /api
  // 1. Asegurar que endpoint comience con /
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // 2. Quitar /api del inicio del endpoint si API_URL ya termina en /api
  if (API_URL.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    cleanEndpoint = cleanEndpoint.substring(4); // Quitar '/api'
  }
  
  // 3. Si API_URL no tiene /api al final y el endpoint no comienza con /api, añadirlo
  if (!API_URL.endsWith('/api') && !cleanEndpoint.startsWith('/api/') && !cleanEndpoint.startsWith('/api')) {
    cleanEndpoint = `/api${cleanEndpoint}`;
  }
  
  // Construir la URL completa
  url = `${API_URL}${cleanEndpoint}`;
  
  console.log("🔍 Endpoint original:", endpoint);
  console.log("🔍 Endpoint limpio:", cleanEndpoint);
  console.log("🌐 URL completa final:", url);
  
  const token = await SecureStore.getItemAsync("travelquest_token");

  const headers: Record<string, string> = {};
   // Añadir token si existe
   if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log("🔑 Token añadido a la petición");
   }

  // 👉 Solo añadir Content-Type si no estás enviando FormData
  const isFormData = options.body instanceof FormData;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  
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

