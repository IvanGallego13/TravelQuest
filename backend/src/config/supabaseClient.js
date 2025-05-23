import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Verificar que tenemos las variables de entorno necesarias
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR: Las variables de entorno SUPABASE_URL y SUPABASE_KEY son requeridas");
  throw new Error('Las variables de entorno SUPABASE_URL y SUPABASE_KEY son requeridas');
}

console.log("🔑 Inicializando cliente Supabase con URL:", supabaseUrl);

// Crear cliente Supabase real
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

// Verificar la conexión
const testConnection = async () => {
  try {
    console.log("🔄 Verificando conexión a Supabase...");
    const { error } = await supabase
      .from('user_locations')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error("❌ Error de conexión a Supabase:", error.message);
      return false;
    }
    
    console.log("✅ Conexión a Supabase establecida correctamente");
    return true;
  } catch (err) {
    console.error("❌ Excepción al verificar conexión a Supabase:", err);
    return false;
  }
};

// Ejecutar prueba de conexión
testConnection();

export { supabase };
