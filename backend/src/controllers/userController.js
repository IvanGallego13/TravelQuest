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
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, score, created_at')
            .order('score', { ascending: false });
            
        if (error) throw error;
        
        res.json(data);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
};

/**
 * Obtener un usuario por ID
 */
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, score, created_at')
            .eq('id', id)
            .single();
            
        if (error) throw error;
        
        if (!data) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(data);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
};