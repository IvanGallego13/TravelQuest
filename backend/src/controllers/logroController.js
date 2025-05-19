import { supabase } from '../config/supabaseClient.js';
import { updateUserLevel } from './userController.js';

// Define all available achievements
export const LOGROS = {
  // Exploración
  PRIMERA_CIUDAD: 'primera_ciudad',
  TROTAMUNDOS: 'trotamundos',
  CIUDADANO_MUNDO: 'ciudadano_mundo',
  MAPA_COMPLETO: 'mapa_completo',
  
  // Misiones
  PRIMERA_MISION: 'primera_mision',
  MISION_FACIL: 'mision_facil',
  MISION_MEDIA: 'mision_media',
  MISION_DIFICIL: 'mision_dificil',
  DIEZ_MISIONES: 'diez_misiones',
  CIEN_MISIONES: 'cien_misiones',
  MARATON_MISIONES: 'maraton_misiones',
  
  // Viajes
  PRIMER_VIAJE: 'primer_viaje',
  CINCO_VIAJES: 'cinco_viajes',
  DIEZ_VIAJES_PLANIFICADOS: 'diez_viajes_planificados',
  
  // Especiales
  VIAJERO_DEL_TIEMPO: 'viajero_del_tiempo',
  COLECCIONISTA: 'coleccionista',
  
  // Bonus
  BONJOUR_PARIS: 'bonjour_paris',
  DE_ARRIBA_A_ABAJO: 'de_arriba_a_abajo',
  MISION_FALLIDA: 'mision_fallida'
};

/**
 * Obtener logros de un usuario
 */
export const getUserAchievements = async (userId) => {
  try {
    // Get user's unlocked achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select(`
        achievement_id,
        unlocked_at,
        achievements (
          id,
          title,
          description,
          points,
          icon,
          category
        )
      `)
      .eq('user_id', userId);

    if (userAchievementsError) throw userAchievementsError;

    // Format the achievements for frontend
    const formattedAchievements = userAchievements.map(achievement => ({
      id: achievement.achievement_id,
      nombre: achievement.achievements.title,
      descripcion: achievement.achievements.description,
      categoria: achievement.achievements.category,
      puntos: achievement.achievements.points,
      icono: achievement.achievements.icon,
      unlocked: true,
      unlocked_at: achievement.unlocked_at
    }));

    return formattedAchievements;
  } catch (error) {
    console.error('Error al obtener logros del usuario:', error);
    throw error;
  }
};

/**
 * Verificar y otorgar logros basados en acciones del usuario
 */
export const checkAndAwardAchievements = async (userId, action, data = {}) => {
  try {
    // Get user's current achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    if (userAchievementsError) throw userAchievementsError;

    // Create a set of achievement IDs the user already has
    const userAchievementIds = new Set(userAchievements.map(a => a.achievement_id));

    // Get all achievements from the database
    const { data: allAchievements, error: allAchievementsError } = await supabase
      .from('achievements')
      .select('*');

    if (allAchievementsError) throw allAchievementsError;

    // Create a map of all achievements
    const achievementsMap = {};
    allAchievements.forEach(a => {
      achievementsMap[a.id] = {
        id: a.id,
        nombre: a.title,
        descripcion: a.description,
        categoria: a.category,
        puntos: a.points,
        icono: a.icon
      };
    });

    // Array to store new achievements
    const newAchievements = [];

    // Check for achievements based on the action
    switch (action) {
      case 'VISIT_CITY':
        await checkCityAchievements(userId, userAchievementIds, achievementsMap, newAchievements);
        break;
      
      case 'COMPLETE_MISSION':
        await checkMissionAchievements(userId, userAchievementIds, achievementsMap, newAchievements, data);
        break;
      
      case 'COMPLETE_TRIP':
        await checkTripAchievements(userId, userAchievementIds, achievementsMap, newAchievements);
        break;
      
      case 'CHECK_SPECIAL_ACHIEVEMENTS':
        await checkSpecialAchievements(userId, userAchievementIds, achievementsMap, newAchievements);
        break;
    }

    // If there are new achievements, insert them and update points
    if (newAchievements.length > 0) {
      console.log(`🏆 Usuario ${userId} ha desbloqueado ${newAchievements.length} logros nuevos`);
      
      // Insert user achievements
      const achievementsToInsert = newAchievements.map(logro => ({
        user_id: userId,
        achievement_id: logro.id,
        unlocked_at: new Date().toISOString()
      }));

      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert(achievementsToInsert);

      if (insertError) throw insertError;

      // Update the user's total points
      const totalPoints = newAchievements.reduce((sum, a) => sum + a.puntos, 0);
      
      const { error: updatePointsError } = await supabase.rpc(
        'increment_points',
        { 
          user_id: userId,
          points_to_add: totalPoints 
        }
      );
      
      if (updatePointsError) {
        console.error(`Error updating points for user ${userId}:`, updatePointsError);
      } else {
        console.log(`💯 Added ${totalPoints} points to user ${userId}`);
      }

      // Update the user's level after earning achievements
      await updateUserLevel(userId);
      
      return { newAchievements, pointsEarned: totalPoints };
    }

    return { newAchievements: [], pointsEarned: 0 };
  } catch (error) {
    console.error('Error checking achievements:', error);
    throw error;
  }
};

// Helper functions to check for specific achievements
async function checkCityAchievements(userId, userAchievementIds, achievementsMap, newAchievements) {
  // Check for first city achievement
  if (!userAchievementIds.has(LOGROS.PRIMERA_CIUDAD)) {
    newAchievements.push(achievementsMap[LOGROS.PRIMERA_CIUDAD]);
  }

  // Check for multiple cities achievements
  const { data: visitedCities, error } = await supabase
    .from('user_missions')
    .select('city_id')
    .eq('user_id', userId)
    .is('completed_at', 'not.null');

  if (error) throw error;

  // Count unique cities
  const uniqueCities = new Set(visitedCities.map(m => m.city_id));
  const cityCount = uniqueCities.size;

  if (cityCount >= 5 && !userAchievementIds.has(LOGROS.TROTAMUNDOS)) {
    newAchievements.push(achievementsMap[LOGROS.TROTAMUNDOS]);
  }

  if (cityCount >= 15 && !userAchievementIds.has(LOGROS.CIUDADANO_MUNDO)) {
    newAchievements.push(achievementsMap[LOGROS.CIUDADANO_MUNDO]);
  }

  // Check for Paris visits
  const parisVisits = visitedCities.filter(m => m.city_id === 'paris').length;
  if (parisVisits > 0 && !userAchievementIds.has(LOGROS.BONJOUR_PARIS)) {
    newAchievements.push(achievementsMap[LOGROS.BONJOUR_PARIS]);
  }
}

async function checkMissionAchievements(userId, userAchievementIds, achievementsMap, newAchievements, data) {
  // First mission achievement
  if (!userAchievementIds.has(LOGROS.PRIMERA_MISION)) {
    newAchievements.push(achievementsMap[LOGROS.PRIMERA_MISION]);
  }

  // Check difficulty-based achievements
  if (data.dificultad === 'facil' && !userAchievementIds.has(LOGROS.MISION_FACIL)) {
    newAchievements.push(achievementsMap[LOGROS.MISION_FACIL]);
  } else if (data.dificultad === 'media' && !userAchievementIds.has(LOGROS.MISION_MEDIA)) {
    newAchievements.push(achievementsMap[LOGROS.MISION_MEDIA]);
  } else if (data.dificultad === 'dificil' && !userAchievementIds.has(LOGROS.MISION_DIFICIL)) {
    newAchievements.push(achievementsMap[LOGROS.MISION_DIFICIL]);
  }

  // Count total completed missions
  const { count, error } = await supabase
    .from('user_missions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('completed_at', 'not.null');

  if (error) throw error;

  if (count >= 10 && !userAchievementIds.has(LOGROS.DIEZ_MISIONES)) {
    newAchievements.push(achievementsMap[LOGROS.DIEZ_MISIONES]);
  }

  if (count >= 100 && !userAchievementIds.has(LOGROS.CIEN_MISIONES)) {
    newAchievements.push(achievementsMap[LOGROS.CIEN_MISIONES]);
  }

  // Check for missions completed in the same day
  const today = new Date().toISOString().split('T')[0];
  const { data: todayMissions, error: todayError } = await supabase
    .from('user_missions')
    .select('*')
    .eq('user_id', userId)
    .is('completed_at', 'not.null')
    .ilike('completed_at', `${today}%`);

  if (todayError) throw todayError;

  if (todayMissions.length >= 5 && !userAchievementIds.has(LOGROS.MARATON_MISIONES)) {
    newAchievements.push(achievementsMap[LOGROS.MARATON_MISIONES]);
  }
}

async function checkTripAchievements(userId, userAchievementIds, achievementsMap, newAchievements) {
  // First trip achievement
  if (!userAchievementIds.has(LOGROS.PRIMER_VIAJE)) {
    newAchievements.push(achievementsMap[LOGROS.PRIMER_VIAJE]);
  }

  // Count completed trips
  const { data: trips, error } = await supabase
    .from('viajes')
    .select('*')
    .eq('user_id', userId)
    .is('fecha_fin', 'not.null');

  if (error) throw error;

  if (trips.length >= 5 && !userAchievementIds.has(LOGROS.CINCO_VIAJES)) {
    newAchievements.push(achievementsMap[LOGROS.CINCO_VIAJES]);
  }

  // Count planned trips
  const { data: plannedTrips, error: plannedError } = await supabase
    .from('viajes')
    .select('*')
    .eq('user_id', userId)
    .is('fecha_inicio', 'not.null')
    .is('duracion', 'not.null');

  if (plannedError) throw plannedError;

  if (plannedTrips.length >= 10 && !userAchievementIds.has(LOGROS.DIEZ_VIAJES_PLANIFICADOS)) {
    newAchievements.push(achievementsMap[LOGROS.DIEZ_VIAJES_PLANIFICADOS]);
  }
}

async function checkSpecialAchievements(userId, userAchievementIds, achievementsMap, newAchievements) {
  // Check for time traveler achievement (same city in different years)
  const { data: trips, error } = await supabase
    .from('viajes')
    .select('ciudad_id, fecha_inicio')
    .eq('user_id', userId)
    .is('fecha_inicio', 'not.null');

  if (error) throw error;

  // Group trips by city
  const citiesVisited = {};
  trips.forEach(trip => {
    if (!trip.fecha_inicio) return;
    
    const year = new Date(trip.fecha_inicio).getFullYear();
    if (!citiesVisited[trip.ciudad_id]) {
      citiesVisited[trip.ciudad_id] = new Set();
    }
    citiesVisited[trip.ciudad_id].add(year);
  });

  // Check if any city was visited in different years
  const timeTraveler = Object.values(citiesVisited).some(years => years.size > 1);
  if (timeTraveler && !userAchievementIds.has(LOGROS.VIAJERO_DEL_TIEMPO)) {
    newAchievements.push(achievementsMap[LOGROS.VIAJERO_DEL_TIEMPO]);
  }

  // Check for collector achievement (at least one achievement in each category)
  if (!userAchievementIds.has(LOGROS.COLECCIONISTA)) {
    const { data: userAchievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select(`
        achievements (
          category
        )
      `)
      .eq('user_id', userId);

    if (achievementsError) throw achievementsError;

    const categories = new Set(userAchievements.map(a => a.achievements.category));
    if (categories.size >= 4) { // At least one from exploracion, misiones, viajes, and bonus
      newAchievements.push(achievementsMap[LOGROS.COLECCIONISTA]);
    }
  }
}