import Constants from 'expo-constants';

export const apiFetch = async (endpoint, options = {}) => {
  try {
    // Add a timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    // Use EXPO_PUBLIC_* variables correctly
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
    
    // Check if we're dealing with FormData
    const isFormData = options.body instanceof FormData;
    
    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        // Don't set Content-Type for FormData, let the browser set it with boundary
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });
    
    clearTimeout(timeoutId);
    
    // Store the response status and ok state
    const responseStatus = response.status;
    const responseOk = response.ok;
    
    // Clone the response before consuming it
    const responseClone = response.clone();
    
    // Try to parse as JSON, but handle non-JSON responses
    let data;
    try {
      data = await responseClone.json();
    } catch (e) {
      // If it's not JSON, get the text
      data = await response.text();
    }
    
    // Create a response-like object
    return {
      ok: responseOk,
      status: responseStatus,
      json: () => Promise.resolve(data),
      text: () => Promise.resolve(typeof data === 'string' ? data : JSON.stringify(data)),
      data: data // Direct access to parsed data
    };
  } catch (error) {
    console.error('API fetch error:', error);
    // Return a response-like object for errors
    return { 
      ok: false, 
      status: error.name === 'AbortError' ? 408 : 500,
      json: () => Promise.resolve({ error: true, message: error.message }),
      text: () => Promise.resolve(error.message),
      data: { error: true, message: error.message }
    };
  }
};