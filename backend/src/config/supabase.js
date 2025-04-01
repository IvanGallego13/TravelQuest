import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Las variables de entorno SUPABASE_URL y SUPABASE_KEY son requeridas');
}

export const supabase = createClient(supabaseUrl, supabaseKey); 