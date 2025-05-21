import { supabase } from '../../config/supabaseClient.js';

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
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, username as nombre, avatar_url as foto_perfil')
      .in('id', userIds);
    if (userError) return res.status(500).json({ error: userError.message });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener el city_id actual del usuario desde user_locations
export const getUsuariosEnMismaCiudad = async (req, res) => {
  const { userId } = req.params;
  try {
    // Obtener el city_id actual del usuario
    const { data: myLoc, error: locError } = await supabase
      .from('user_locations')
      .select('city_id')
      .eq('user_id', userId)
      .order('last_seen_at', { ascending: false })
      .limit(1);
    if (locError) return res.status(500).json({ error: locError.message });
    if (!myLoc || myLoc.length === 0) return res.json([]);
    const cityId = myLoc[0].city_id;
    // Buscar todos los usuarios con ese city_id
    const { data: usersLoc, error: usersLocError } = await supabase
      .from('user_locations')
      .select('user_id')
      .eq('city_id', cityId);
    if (usersLocError) return res.status(500).json({ error: usersLocError.message });
    const userIds = usersLoc.map(u => u.user_id).filter(id => id !== userId);
    if (userIds.length === 0) return res.json([]);
    // Obtener datos de los usuarios
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id, username as nombre, avatar_url as foto_perfil')
      .in('id', userIds);
    if (userError) return res.status(500).json({ error: userError.message });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 