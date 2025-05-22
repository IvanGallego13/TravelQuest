import { supabase } from '../../config/supabaseClient.js';

// Verificar qué tipo de cliente Supabase estamos usando
console.log("Tipo de cliente Supabase:", typeof supabase.from === 'function' ? "Real" : "Simulado");

// Obtener la ciudad actual del usuario (última entrada en travel_days)
export const getCiudadActual = async (req, res) => {
  const { userId } = req.params;
  try {
    const { data, error } = await supabase
      .from('travel_days')
      .select('city')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1);
    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.length === 0) return res.json({ ciudad: null });
    res.json({ ciudad: data[0].city });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener usuarios en una ciudad (última entrada en travel_days)
export const getUsuariosEnCiudad = async (req, res) => {
  const { ciudad } = req.params;
  try {
    // Obtener los últimos registros de cada usuario en travel_days
    const { data, error } = await supabase
      .from('travel_days')
      .select('user_id, city, date')
      .order('date', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    // Filtrar usuarios cuya última ciudad es la buscada
    const latestByUser = {};
    for (const row of data) {
      if (!latestByUser[row.user_id]) {
        latestByUser[row.user_id] = row;
      }
    }
    const userIds = Object.values(latestByUser)
      .filter((row) => row.city === ciudad)
      .map((row) => row.user_id);
    if (userIds.length === 0) return res.json([]);
    // Obtener datos de los usuarios
    const { data: usersRaw, error: userError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds);
    if (userError) return res.status(500).json({ error: userError.message });
    
    // Transformar los nombres de las propiedades
    const users = usersRaw.map(u => ({
      id: u.id,
      nombre: u.username, 
      foto_perfil: u.avatar_url
    }));
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener el city_id actual del usuario desde user_locations
export const getUsuariosEnMismaCiudad = async (req, res) => {
  const { userId } = req.params;
  try {
    console.log("🔍 Buscando usuarios en la misma ciudad para el usuario:", userId);
    console.log("📊 Estado de la conexión Supabase:", supabase ? "Conectado" : "No conectado");
    
    // Verificar si user_locations existe en Supabase
    try {
      const { error: testError } = await supabase
        .from('user_locations')
        .select('count')
        .limit(1);
      if (testError) {
        console.error("❌ Error al verificar tabla user_locations:", testError);
      } else {
        console.log("✅ Tabla user_locations existe y es accesible");
      }
    } catch (testErr) {
      console.error("❌ Excepción al verificar tabla user_locations:", testErr);
    }
    
    // Obtener el city_id actual del usuario
    console.log("👤 Consultando city_id para usuario:", userId);
    const { data: myLoc, error: locError } = await supabase
      .from('user_locations')
      .select('city_id')
      .eq('user_id', userId)
      .order('last_seen_at', { ascending: false })
      .limit(1);
    
    console.log("📬 Resultado de la consulta city_id:", myLoc);
    
    if (locError) {
      console.error("❌ Error al obtener localización del usuario:", locError);
      return res.status(500).json({ error: locError.message });
    }
    
    if (!myLoc || myLoc.length === 0) {
      console.log("⚠️ No se encontró localización para el usuario:", userId);
      return res.json([]);
    }
    
    const cityId = myLoc[0].city_id;
    console.log("🏙️ Ciudad encontrada:", cityId);
    
    // Calcular el tiempo límite (2 minutos atrás)
    const dosMinutosAtras = new Date();
    dosMinutosAtras.setMinutes(dosMinutosAtras.getMinutes() - 2);
    const tiempoLimite = dosMinutosAtras.toISOString();
    console.log("⏱️ Filtrando usuarios localizados después de:", tiempoLimite);
    
    // Buscar todos los usuarios con ese city_id que se hayan geolocalizado en los últimos 2 minutos
    const { data: usersLoc, error: usersLocError } = await supabase
      .from('user_locations')
      .select('user_id, last_seen_at')
      .eq('city_id', cityId)
      .gte('last_seen_at', tiempoLimite);
    
    if (usersLocError) {
      console.error("❌ Error al buscar usuarios en la misma ciudad:", usersLocError);
      return res.status(500).json({ error: usersLocError.message });
    }
    
    const userIds = usersLoc.map(u => u.user_id).filter(id => id !== userId);
    console.log("👥 Usuarios encontrados en la misma ciudad en los últimos 2 minutos (excluyendo al usuario actual):", userIds);
    
    if (userIds.length === 0) {
      console.log("⚠️ No hay otros usuarios recientes en esta ciudad");
      return res.json([]);
    }
    
    // Obtener datos de los usuarios
    console.log("👤 Consultando perfiles para usuarios:", userIds);
    
    // CORRECCIÓN: Cambiar la forma de hacer la consulta para evitar el error de alias
    const { data: usersRaw, error: userError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds);
    
    if (userError) {
      console.error("❌ Error al obtener perfiles de usuarios:", userError);
      return res.status(500).json({ error: userError.message });
    }
    
    // Transformar los nombres de las propiedades para mantener la misma respuesta esperada
    const users = usersRaw.map(u => ({
      id: u.id,
      nombre: u.username, 
      foto_perfil: u.avatar_url
    }));
    
    console.log("✅ Devolviendo perfiles de usuarios:", users);
    res.json(users);
  } catch (err) {
    console.error("❌ Error general:", err);
    res.status(500).json({ error: err.message });
  }
}; 