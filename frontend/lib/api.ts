import * as SecureStore from 'expo-secure-store';

// Constants
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.159:3000/api';
const TOKEN_KEY = 'travelquest_token';
const DEFAULT_TIMEOUT = 45000; // Increase timeout to 45 seconds
const MAX_RETRIES = 2; // Maximum number of retry attempts

export async function apiFetch(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<Response> {
  // Validar que el endpoint esté definido
  if (!endpoint) {
    console.error("❌ Error: Endpoint no especificado");
    throw new Error("Endpoint no especificado");
  }
  
  // Asegurarse de que el endpoint comienza con /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const url = `${API_URL}${normalizedEndpoint}`;
  console.log(`🌐 Llamando a: ${url} (intento ${retryCount + 1}/${MAX_RETRIES + 1})`);

  try {
    // Get token from SecureStore
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    console.log("🔑 Token disponible:", token ? "Sí" : "No");
    
    // Check if we're dealing with FormData
    const isFormData = options.body instanceof FormData;
    
    // Configure headers based on content type
    let headers: Record<string, string> = {};
    
    if (!isFormData) {
      // For JSON requests
      headers["Content-Type"] = "application/json";
    }
    // Don't set Content-Type for FormData - let the browser set it with boundary
    
    // Add any custom headers from options
    if (options.headers) {
      headers = { ...headers, ...(options.headers as Record<string, string>) };
    }
    
    // Add authorization if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No hay token disponible para la petición:", normalizedEndpoint);
    }

    // Create the final request options
    const requestOptions: RequestInit = {
      ...options,
      headers,
    };

    // Log FormData contents for debugging
    if (isFormData && options.body) {
      console.log("📦 Enviando FormData con los siguientes campos:");
      const formData = options.body as FormData;
      for (let [key, value] of formData.entries()) {
        if (typeof value === 'object' && value !== null) {
          console.log(`${key}: [Objeto File/Blob]`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
    }

    // Crear un AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout
    
    const response = await fetch(url, {
      ...requestOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📥 Respuesta de ${normalizedEndpoint}: ${response.status}`);
    return response;
    
  } catch (error: any) {
    // Handle network errors
    if (error.message && error.message.includes('Network request failed')) {
      console.error(`📶 Error de red: ${error.message}`);
      
      if (retryCount < MAX_RETRIES) {
        const backoff = Math.min(1000 * (retryCount + 1), 3000); // Exponential backoff with max 3 seconds
        console.log(`🔄 Reintentando en ${backoff/1000} segundos...`);
        
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(apiFetch(normalizedEndpoint, options, retryCount + 1));
          }, backoff);
        });
      }
    }
    
    // Handle timeout errors with retry logic
    if (error.name === 'AbortError') {
      console.error(`⏰ Timeout en petición a ${normalizedEndpoint}`);
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Reintentando petición a ${normalizedEndpoint} (${retryCount + 1}/${MAX_RETRIES})...`);
        return apiFetch(normalizedEndpoint, options, retryCount + 1);
      }
    }
    
    console.error(`❌ Error en fetch a ${normalizedEndpoint}:`, error);
    
    // Crear una respuesta de error para mantener consistencia en la interfaz
    const errorResponse = new Response(JSON.stringify({ 
      error: error.message || 'Error de conexión' 
    }), { 
      status: 0, 
      statusText: error.message || 'Error de conexión'
    });
    
    return errorResponse;
  }
}

