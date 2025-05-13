import * as SecureStore from 'expo-secure-store';

// Constants
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.159:3000/api';
const TOKEN_KEY = 'travelquest_token';
const DEFAULT_TIMEOUT = 45000; // Increase timeout to 45 seconds
const MAX_RETRIES = 2; // Maximum number of retry attempts

export async function apiFetch(endpoint: string, options: RequestInit = {}, retryCount = 0) {
  const url = `${API_URL}${endpoint}`;
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
      console.warn("⚠️ No hay token disponible para la petición:", endpoint);
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

    // Make the request with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.warn(`⏱️ La petición a ${endpoint} ha excedido el tiempo límite de ${DEFAULT_TIMEOUT/1000} segundos`);
    }, DEFAULT_TIMEOUT);
    
    const response = await fetch(url, {
      ...requestOptions,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log(`📥 Respuesta de ${endpoint}: ${response.status}`);
    return response;
    
  } catch (error: any) {
    // Handle timeout errors with retry logic
    if (error.name === 'AbortError') {
      console.error(`⏱️ Timeout en la petición a ${endpoint}`);
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Reintentando petición a ${endpoint} (${retryCount + 1}/${MAX_RETRIES})...`);
        return apiFetch(endpoint, options, retryCount + 1);
      }
    }
    
    console.error(`❌ Error en fetch a ${endpoint}:`, error);
    throw error;
  }
}

