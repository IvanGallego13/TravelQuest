import { supabase } from '../config/supabaseClient.js';
import { LOGROS } from '../controllers/logroController.js';

/**
 * Actualiza el nivel del usuario basado en sus logros y misiones completadas
 * @param {string} userId - ID del usuario
 */
export const updateUserLevel = async (userId) => {
    try {
        console.log(`🔄 Actualizando nivel para usuario: ${userId}`);
        
        // 1. Obtener los logros del usuario
        const { data: userAchievements, error: achievementsError } = await supabase
            .from('user_achievements')
            .select('achievement_id')
            .eq('user_id', userId);
            
        if (achievementsError) throw achievementsError;
        
        // 2. Calcular puntos de logros
        let achievementPoints = 0;
        
        if (userAchievements && userAchievements.length > 0) {
            // Mapear los IDs de logros a sus valores de puntos usando el objeto LOGROS
            achievementPoints = userAchievements.reduce((total, achievement) => {
                const achievementId = achievement.achievement_id;
                // Buscar el logro en el objeto LOGROS
                const foundAchievement = Object.values(LOGROS).find(logro => logro.id === achievementId);
                return total + (foundAchievement ? foundAchievement.puntos : 0);
            }, 0);
        }
        
        console.log(`📊 Puntos de logros: ${achievementPoints}`);
        
        // 3. Obtener misiones completadas del usuario
        const { data: completedMissions, error: missionsError } = await supabase
            .from('user_missions')
            .select('mission_id, status')
            .eq('user_id', userId)
            .eq('status', 'completed');
            
        if (missionsError) throw missionsError;
        
        // 4. Calcular puntos de misiones basados en su dificultad
        let missionPoints = 0;
        
        if (completedMissions && completedMissions.length > 0) {
            // Obtener los IDs de las misiones completadas
            const missionIds = completedMissions.map(mission => mission.mission_id);
            
            // Obtener información de dificultad para cada misión
            const { data: missionsData, error: missionDataError } = await supabase
                .from('missions')
                .select('id, difficulty')
                .in('id', missionIds);
                
            if (missionDataError) throw missionDataError;
            
            // Calcular puntos basados en la dificultad
            missionPoints = missionsData.reduce((total, mission) => {
                // Puntos: 10 para fácil (1), 20 para normal (3), 30 para difícil (5)
                const difficultyPoints = mission.difficulty === 1 ? 10 : 
                                        mission.difficulty === 3 ? 20 : 
                                        mission.difficulty === 5 ? 30 : 0;
                return total + difficultyPoints;
            }, 0);
        }
        
        console.log(`📊 Puntos de misiones: ${missionPoints}`);
        
        // 5. Calcular puntuación total
        const totalPoints = achievementPoints + missionPoints;
        console.log(`📊 Puntos totales: ${totalPoints}`);
        
        // 6. Actualizar el score (nivel) del usuario en la tabla profiles
        // Ahora el nivel es igual a los puntos totales
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ score: totalPoints })
            .eq('id', userId);
            
        if (updateError) throw updateError;
        
        console.log(`✅ Nivel actualizado para usuario ${userId}: ${totalPoints} puntos`);
        return totalPoints;
        
    } catch (error) {
        console.error('❌ Error actualizando nivel de usuario:', error);
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