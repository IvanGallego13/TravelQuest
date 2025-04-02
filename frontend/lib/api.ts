import Constants from "expo-constants";

const API_URL = Constants.expoConfig?.extra?.API_URL;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${API_URL}${endpoint}`;

  try {
    const res = await fetch(url, options);
    return res;
  } catch (error) {
    console.error("Error al llamar a la API:", error);
    throw error;
  }
}
