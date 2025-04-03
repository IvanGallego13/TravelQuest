import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
/*
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY; // Supabase API Key

const supabase = createClient(supabaseUrl, supabaseAnonKey);
*/
// Cliente simulado para desarrollo
const createMockSupabaseClient = () => {
  console.log('⚠️ Usando cliente de Supabase simulado para desarrollo');
  
  return {
    auth: {
      signUp: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
      signInWithPassword: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
      getUser: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null })
    },
    from: (table) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: { id: 'mock-id' }, error: null }),
          order: () => ({ data: [], error: null })
        }),
        insert: () => ({ data: [{ id: 'mock-id' }], error: null }),
        update: () => ({ data: [{ id: 'mock-id' }], error: null }),
        delete: () => ({ error: null })
      }),
      insert: () => ({ data: [{ id: 'mock-id' }], error: null }),
      update: () => ({ data: [{ id: 'mock-id' }], error: null }),
      delete: () => ({ error: null })
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: { path: 'mock-path' }, error: null })
      })
    }
  };
};

// Usar cliente real o simulado según el entorno
const isDevelopment = process.env.NODE_ENV === 'development';
const useMockClient = isDevelopment && (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('tu_url'));

let supabase;

if (useMockClient) {
  supabase = createMockSupabaseClient();
} else {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Las variables de entorno SUPABASE_URL y SUPABASE_KEY son requeridas');
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };
