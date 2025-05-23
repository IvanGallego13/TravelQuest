import * as SecureStore from 'expo-secure-store';

export async function getCurrentUserId(): Promise<string | null> {
  return await SecureStore.getItemAsync('travelquest_user_id');
} 