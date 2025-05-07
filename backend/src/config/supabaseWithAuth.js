import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function createSupabaseClientWithAuth(token) {
  return createClient(supabaseUrl, serviceRoleKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  });
}


