// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Estas variables deben venir de tu archivo .env y ser accesibles por Expo
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);
