import { supabase } from '../config/supabaseClient.js';
import { LOGROS } from '../controllers/logrocontroller.js';

/**
 * Actualiza el nivel del usuario basado en sus logros y misiones completadas
 * @param {string} userId - ID del usuario
 */
// Add this function to your userController.js

/**
 * Actualiza el nivel del usuario basado en sus puntos
 * @param {string} userId - ID del usuario
 */
// In the updateUserLevel function, change 'level' to 'score'

export const updateUserLevel = async (userId) => {
  try {
    // First, get the current score
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('score') // Changed from 'level' to 'score'
      .eq('id', userId)
      .single();

    if (userError) {
      console.error("Error getting user score:", userError);
      throw userError;
    }

    // Calculate new score (add points for completing a mission)
    const currentScore = userData?.score || 0; // Changed from 'level' to 'score'
    const pointsToAdd = 10; // Points for completing a mission
    const newScore = currentScore + pointsToAdd;

    // Update the user's score
    const { error: levelError } = await supabase
      .from('profiles')
      .update({ score: newScore }) // Changed from 'level' to 'score'
      .eq('id', userId);

    if (levelError) {
      console.error("Error updating user level:", levelError);
      throw levelError;
    }

    return { success: true, newScore };
  } catch (error) {
    console.error("Error updating user level:", error);
    throw error;
  }
};

/**
 * Obtener perfil completo del usuario con puntos y logros
 */
export const getUserProfileComplete = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`📱 Obteniendo perfil completo para usuario: ${userId}`);
        
        // Obtener datos del perfil
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
            
        if (profileError) throw profileError;
        
        // Obtener logros del usuario
        const { data: userAchievements, error: achievementsError } = await supabase
            .from('user_achievements')
            .select('achievement_id, unlocked_at')
            .eq('user_id', userId);
            
        if (achievementsError) throw achievementsError;
        
        // Obtener misiones completadas
        const { data: completedMissions, error: missionsError } = await supabase
            .from('user_missions')
            .select('mission_id, status, completed_at, image_url')
            .eq('user_id', userId)
            .eq('status', 'completed');
            
        if (missionsError) throw missionsError;
        
        // Devolver toda la información
        res.json({
            success: true,
            profile,
            achievements: userAchievements || [],
            completedMissions: completedMissions || [],
            totalPoints: profile.score || 0
        });
        
    } catch (error) {
        console.error('❌ Error al obtener perfil de usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil',
            error: error.message
        });
    }
};

/**
 * Obtener todos los usuarios
 */
export const getAllUsers = async (req, res) => {
    try {
        console.log(`🔍 Obteniendo lista de todos los usuarios`);
        
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, score, created_at')
            .order('score', { ascending: false });
            
        if (error) throw error;
        
        // Transformar los datos al formato esperado por el frontend
        const formattedUsers = data.map(user => ({
            id: user.id,
            nombre: user.username,
            foto_perfil: user.avatar_url,
            nivel: user.score || 0
        }));
        
        console.log(`✅ Encontrados ${formattedUsers.length} usuarios`);
        res.json(formattedUsers);
    } catch (error) {
        console.error('❌ Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

/**
 * Obtener un usuario por ID
 */
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Buscando usuario con ID: ${id}`);
        
        // Verificar si el ID es un UUID válido
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        let formattedId = id;
        
        // Si no es un UUID válido pero es un número, intentar convertirlo a formato UUID
        if (!uuidRegex.test(id) && /^\d+$/.test(id)) {
            const strId = String(id).padStart(12, '0');
            formattedId = `00000000-0000-4000-a000-${strId}`;
            console.log(`🧩 Convertido ID simple ${id} a UUID: ${formattedId}`);
        }
        
        // Buscar con el ID formateado
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, score, created_at')
            .eq('id', formattedId)
            .single();
            
        if (error) {
            console.error(`❌ Error al buscar usuario:`, error);
            throw error;
        }
        
        if (!data) {
            console.error(`❌ Usuario con ID ${id} no encontrado`);
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Transformar al formato esperado por el frontend
        const formattedUser = {
            id: data.id,
            nombre: data.username,
            foto_perfil: data.avatar_url,
            nivel: data.score || 0,
            username: data.username
        };
        
        console.log(`✅ Usuario encontrado: ${data.username}`);
        res.json(formattedUser);
    } catch (error) {
        console.error(`❌ Error al obtener usuario:`, error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};

/**
 * Obtener datos de varios usuarios por sus IDs
 */
export const getUsersBulk = async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Debes proporcionar un array de IDs.' });
    }
    try {
        console.log(`🔍 Buscando usuarios con IDs:`, ids);
        
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username as nombre, avatar_url as foto_perfil')
            .in('id', ids);
            
        if (error) return res.status(500).json({ error: error.message });
        
        console.log(`✅ Encontrados ${data.length} usuarios`);
        res.json(data);
    } catch (error) {
        console.error(`❌ Error al obtener usuarios por IDs:`, error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtener un usuario por su nombre de usuario
 */
export const getUserByUsername = async (req, res) => {
    const { username } = req.params;
    
    console.log("🔍 Buscando usuario por nombre:", username);
    
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, score, created_at')
            .ilike('username', username)
            .single();
            
        if (error) {
            console.error("❌ Error al buscar usuario por nombre:", error);
            return res.status(500).json({ error: error.message });
        }
        
        if (!data) {
            console.error("❌ Usuario no encontrado:", username);
            return res.status(404).json({ error: `No se encontró usuario con nombre: ${username}` });
        }
        
        // Transformar al formato esperado por el frontend
        const formattedUser = {
            id: data.id, // Este es el UUID que necesitamos
            nombre: data.username,
            foto_perfil: data.avatar_url,
            nivel: data.score || 0,
            username: data.username
        };
        
        console.log("✅ Usuario encontrado:", data.username, "con ID:", data.id);
        res.json(formattedUser);
    } catch (err) {
        console.error("❌ Error general al buscar usuario:", err);
        res.status(500).json({ error: err.message });
    }
};