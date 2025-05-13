import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: './.env' });
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createSupabaseClientWithAuth(token) {

  console.log("🔐 SERVICE_ROLE_KEY detectado:", process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(0, 10), "..."); // solo los primeros caracteres por seguridad

  return createClient(supabaseUrl, serviceRoleKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}


