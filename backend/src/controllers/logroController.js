import { supabase } from '../config/supabaseClient.js';
import { updateUserLevel } from './usercontroller.js';

// Define achievement types
export const LOGROS = {
  PRIMERA_CIUDAD: 'primera_ciudad',
  TROTAMUNDOS: 'trotamundos',
  CIUDADANO_MUNDO: 'ciudadano_mundo',
  MAPA_COMPLETO: 'mapa_completo',
  PRIMERA_MISION: 'primera_mision',
  MISION_FACIL: 'mision_facil',
  MISION_MEDIA: 'mision_media',
  MISION_DIFICIL: 'mision_dificil',
  DIEZ_MISIONES: 'diez_misiones',
  CIEN_MISIONES: 'cien_misiones',
  // Add other achievement types as needed
};

/**
 * Get all achievements for a user
 */
export const getUserAchievements = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting user achievements:', error);
    throw error;
  }
};

/**
 * Check and award achievements for a user
 */
/**
 * Checks and awards achievements for a user based on an action
 * @param {string} userId - The user ID
 * @param {string} action - The action that triggered the achievement check
 * @returns {Promise<{newAchievements: Array, pointsEarned: number}>}
 */
export const checkAndAwardAchievements = async (userId, action = 'CHECK_MISSIONS') => {
  try {
    console.log(`🏆 Verificando logros para usuario ${userId} por acción: ${action}`);
    
    if (!userId) {
      throw new Error("Se requiere ID de usuario para verificar logros");
    }
    
    // Get all achievements
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*');
      
    if (achievementsError) throw achievementsError;
    
    // Get user's current achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userId);
      
    if (userAchievementsError) throw userAchievementsError;
    
    // Get user's completed missions
    const { data: completedMissions, error: missionsError } = await supabase
      .from('user_missions')
      .select('mission_id, missions(city_id)')
      .eq('user_id', userId)
      .eq('status', 'completed');
      
    if (missionsError) throw missionsError;
    
    // Get user profile for current points
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('points, level')
      .eq('id', userId)
      .single();
      
    if (profileError) throw profileError;
    
    // Extract IDs of achievements the user already has
    const userAchievementIds = userAchievements.map(a => a.achievement_id);
    
    // Filter achievements that the user doesn't have yet
    const availableAchievements = allAchievements.filter(
      achievement => !userAchievementIds.includes(achievement.id)
    );
    
    // Check each achievement condition
    const newlyUnlockedAchievements = [];
    let totalPointsEarned = 0;
    
    for (const achievement of availableAchievements) {
      let unlocked = false;
      
      // Check different achievement types
      switch (achievement.condition_type) {
        case 'COMPLETE_FIRST_MISSION':
          unlocked = completedMissions.length > 0;
          break;
          
        case 'COMPLETE_N_MISSIONS':
          unlocked = completedMissions.length >= achievement.condition_value;
          break;
          
        case 'VISIT_N_CITIES':
          // Get unique cities from completed missions
          const visitedCities = new Set(
            completedMissions
              .map(m => m.missions?.city_id)
              .filter(Boolean)
          );
          unlocked = visitedCities.size >= achievement.condition_value;
          break;
          
        case 'REACH_LEVEL':
          unlocked = userProfile.level >= achievement.condition_value;
          break;
          
        // Add more achievement types as needed
      }
      
      // If achievement is unlocked, add it to the user's achievements
      if (unlocked) {
        const now = new Date().toISOString();
        
        const { error: insertError } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
            unlocked_at: now
          });
          
        if (insertError) {
          console.error(`Error al guardar logro ${achievement.id}:`, insertError);
          continue; // Skip this achievement if there's an error
        }
        
        // Add points to user
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            points: userProfile.points + achievement.points 
          })
          .eq('id', userId);
          
        if (updateError) {
          console.error('Error al actualizar puntos:', updateError);
        } else {
          totalPointsEarned += achievement.points;
        }
        
        // Add to newly unlocked achievements
        newlyUnlockedAchievements.push(achievement);
      }
    }
    
    console.log(`✅ Verificación completada. Nuevos logros: ${newlyUnlockedAchievements.length}, Puntos: ${totalPointsEarned}`);
    
    return {
      newAchievements: newlyUnlockedAchievements,
      pointsEarned: totalPointsEarned
    };
    
  } catch (error) {
    console.error('Error al verificar logros:', error);
    throw error;
  }
};

/**
 * Check a single achievement and award it if conditions are met
 */
async function checkSingleAchievement(
  achievementCode,
  conditionMet,
  userId,
  unlockedAchievementIds,
  allAchievements,
  newAchievements,
  addPoints
) {
  try {
    // Find the achievement in the database
    const achievement = allAchievements.find(a => a.code === achievementCode);
    
    if (!achievement) {
      console.warn(`Achievement with code ${achievementCode} not found`);
      return false;
    }
    
    // Check if already unlocked
    if (unlockedAchievementIds.includes(achievement.id)) {
      return false; // Already unlocked
    }
    
    // Check if condition is met
    if (conditionMet) {
      // Award the achievement
      const { error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: userId,
          achievement_id: achievement.id,
          unlocked_at: new Date().toISOString()
        });
        
      if (error) {
        console.error(`Error awarding achievement ${achievementCode}:`, error);
        return false;
      }
      
      // Add to new achievements list
      newAchievements.push(achievement);
      
      // Add points
      addPoints(achievement.points || 0);
      
      console.log(`🏆 Achievement unlocked: ${achievement.title} (+${achievement.points} points)`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error checking achievement ${achievementCode}:`, error);
    return false;
  }
}

/**
 * Update user's score with achievement points
 */
async function updateUserScore(userId, pointsToAdd) {
  try {
    // Get current score
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('score')
      .eq('id', userId)
      .single();
      
    if (userError) throw userError;
    
    const currentScore = userData?.score || 0;
    const newScore = currentScore + pointsToAdd;
    
    // Update score
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ score: newScore })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    console.log(`👤 User score updated: ${currentScore} → ${newScore} (+${pointsToAdd})`);
    return newScore;
  } catch (error) {
    console.error('Error updating user score:', error);
    throw error;
  }
}
// Add this function to your logrocontroller.js file
export const getAllAchievements = async (req, res) => {
  try {
    console.log("📊 Obteniendo todos los logros disponibles");
    
    // Get all achievements from the database
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*');
      
    if (error) throw error;
    
    console.log(`✅ ${achievements.length} logros encontrados`);
    res.status(200).json(achievements);
  } catch (error) {
    console.error("❌ Error al obtener logros:", error.message);
    res.status(500).json({ 
      message: "Error al obtener logros", 
      error: error.message 
    });
  }
};
