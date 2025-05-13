import { supabase } from '../config/supabaseClient.js';
import { updateUserLevel } from './userController.js';
        
// Export LOGROS so it can be used in other files
export { LOGROS };

// Definición de logros y sus puntos
const LOGROS = {
    // 🗺️ Exploración
    PRIMERA_CIUDAD: {
        id: 'primera_ciudad',
        nombre: 'Primera parada',
        descripcion: 'Visita tu primera ciudad',
        categoria: 'exploracion',
        puntos: 10,
        icono: '🗺️'
    },
    TROTAMUNDOS: {
        id: 'trotamundos',
        nombre: 'Trotamundos',
        descripcion: 'Explora 5 ciudades distintas',
        categoria: 'exploracion',
        puntos: 50,
        icono: '🗺️'
    },
    CIUDADANO_MUNDO: {
        id: 'ciudadano_mundo',
        nombre: 'Ciudadano del mundo',
        descripcion: 'Explora 15 ciudades en total',
        categoria: 'exploracion',
        puntos: 150,
        icono: '🗺️'
    },
    MAPA_COMPLETO: {
        id: 'mapa_completo',
        nombre: 'Mapa completo',
        descripcion: 'Completa todas las misiones de una ciudad',
        categoria: 'exploracion',
        puntos: 100,
        icono: '🗺️'
    },

    // 🪂 Misiones completadas
    PRIMERA_MISION: {
        id: 'primera_mision',
        nombre: 'Primer paso',
        descripcion: 'Completa tu primera misión',
        categoria: 'misiones',
        puntos: 10,
        icono: '🪂'
    },
    MISION_FACIL: {
        id: 'mision_facil',
        nombre: 'Reto inicial',
        descripcion: 'Completa una misión de dificultad fácil',
        categoria: 'misiones',
        puntos: 10,
        icono: '🪂'
    },
    MISION_MEDIA: {
        id: 'mision_media',
        nombre: 'En marcha',
        descripcion: 'Completa una misión de dificultad normal',
        categoria: 'misiones',
        puntos: 20,
        icono: '🪂'
    },
    MISION_DIFICIL: {
        id: 'mision_dificil',
        nombre: 'Misión Imposible',
        descripcion: 'Completa una misión de dificultad difícil',
        categoria: 'misiones',
        puntos: 30,
        icono: '🪂'
    },
    DIEZ_MISIONES: {
        id: 'diez_misiones',
        nombre: 'Subiendo de nivel',
        descripcion: 'Completa 10 misiones',
        categoria: 'misiones',
        puntos: 100,
        icono: '🪂'
    },
    CIEN_MISIONES: {
        id: 'cien_misiones',
        nombre: 'Leyenda viajera',
        descripcion: 'Completa 100 misiones',
        categoria: 'misiones',
        puntos: 500,
        icono: '🪂'
    },
    MARATON_MISIONES: {
        id: 'maraton_misiones',
        nombre: 'Maratón viajera',
        descripcion: 'Completa 5 misiones en un mismo día',
        categoria: 'misiones',
        puntos: 50,
        icono: '🪂'
    },

    // 📒 Viajes
    PRIMER_VIAJE: {
        id: 'primer_viaje',
        nombre: 'Mochilero',
        descripcion: 'Completa tu primer viaje',
        categoria: 'viajes',
        puntos: 20,
        icono: '📒'
    },
    CINCO_VIAJES: {
        id: 'cinco_viajes',
        nombre: 'Explorador experto',
        descripcion: 'Realiza 5 viajes completos',
        categoria: 'viajes',
        puntos: 100,
        icono: '📒'
    },
    DIEZ_VIAJES_PLANIFICADOS: {
        id: 'diez_viajes_planificados',
        nombre: 'Planificador',
        descripcion: 'Agrega fechas y duración a 10 viajes',
        categoria: 'viajes',
        puntos: 80,
        icono: '📒'
    },

    /*
    // 📸 Diario
    PRIMERA_FOTO: {
        id: 'primera_foto',
        nombre: 'Primer recuerdo',
        descripcion: 'Sube una foto a tu diario',
        categoria: 'diario',
        puntos: 5,
        icono: '📸'
    },
    HISTORIA_LARGA: {
        id: 'historia_larga',
        nombre: 'Historias que inspiran',
        descripcion: 'Escribe una entrada de más de 500 caracteres',
        categoria: 'diario',
        puntos: 10,
        icono: '📸'
    },
    TREINTA_ENTRADAS: {
        id: 'treinta_entradas',
        nombre: 'Viajero crónico',
        descripcion: 'Sube 30 entradas en total',
        categoria: 'diario',
        puntos: 50,
        icono: '📸'
    },
    RACHA_DIARIA: {
        id: 'racha_diaria',
        nombre: 'Una por día',
        descripcion: 'Agrega una entrada diaria durante al menos 5 días seguidos',
        categoria: 'diario',
        puntos: 30,
        icono: '📸'
    },*/

    // 🎁 Especiales o secretos
    /*
    PRECISION_TOTAL: {
        id: 'precision_total',
        nombre: 'Precisión total',
        descripcion: 'Valida exitosamente 5 imágenes seguidas con Google Vision',
        categoria: 'especial',
        puntos: 1000,
        icono: '🎁'
    },*/
    VIAJERO_DEL_TIEMPO: {
        id: 'viajero_del_tiempo',
        nombre: 'Viajero del tiempo',
        descripcion: 'Realiza un viaje a la misma ciudad en años distintos',
        categoria: 'especial',
        puntos: 500,
        icono: '🎁'
    },
    COLECCIONISTA: {
        id: 'coleccionista',
        nombre: 'Coleccionista',
        descripcion: 'Consigue al menos 1 logro de cada categoría',
        categoria: 'especial',
        puntos: 200,
        icono: '🎁'
    },

    // Bonus (Graciosos o inesperados)
    BONJOUR_PARIS: {
        id: 'bonjour_paris',
        nombre: '“Bonjour, París”',
        descripcion: 'El típico logro por visitar París',
        categoria: 'bonus',
        puntos: 30,
        icono: '😄'
    },
    DE_ARRIBA_A_ABAJO: {
        id: 'de_arriba_a_abajo',
        nombre: '“De arriba a abajo”',
        descripcion: 'Caminaste más de 20 km en un solo viaje',
        categoria: 'bonus',
        puntos: 40,
        icono: '🚶'
    },
    MISION_FALLIDA: {
        id: 'mision_fallida',
        nombre: '“Misión fallida”',
        descripcion: 'No completaste ninguna misión en un viaje (¡ups!)',
        categoria: 'bonus',
        puntos: -10,
        icono: '😅'
    }
};

/**
 * Verificar y otorgar logros a un usuario
 */
export const checkAndAwardAchievements = async (userId, action, data) => {
    try {
        // Obtener logros actuales del usuario
        const { data: userAchievements, error: achievementsError } = await supabase
            .from('Usuario_Logros') // Nombre de tabla correcto
            .select('Logros_id') // Nombre de columna correcto
            .eq('Usuario_id', userId); // Nombre de columna correcto

        if (achievementsError) throw achievementsError;

        const achievedIds = userAchievements.map(a => a.Logros_id);

        // Obtener información del usuario (para conteos)
        const { data: userData, error: userError } = await supabase
            .from('Usuario') // Nombre de tabla correcto
            .select('idusuario')
            .eq('idusuario', userId)
            .single();

        if (userError) throw userError;

        const newAchievements = [];

        // Verificar logros según la acción
        switch (action) {
            case 'COMPLETE_MISSION':
                if (!achievedIds.includes(LOGROS.PRIMERA_MISION.id)) {
                    newAchievements.push(LOGROS.PRIMERA_MISION);
                }
                if (data?.dificultad === 'facil' && !achievedIds.includes(LOGROS.MISION_FACIL.id)) {
                    newAchievements.push(LOGROS.MISION_FACIL);
                }
                if (data?.dificultad === 'medio' && !achievedIds.includes(LOGROS.MISION_MEDIA.id)) {
                    newAchievements.push(LOGROS.MISION_MEDIA);
                }
                if (data?.dificultad === 'dificil' && !achievedIds.includes(LOGROS.MISION_DIFICIL.id)) {
                    newAchievements.push(LOGROS.MISION_DIFICIL);
                }
                // Verificar conteo de misiones completadas
                const { count: completedMissionsCount, error: countMissionsError } = await supabase
                    .from('Viaje_Misiones') // Nombre de tabla correcto
                    .select('*', { count: 'exact' })
                    .eq('Viaje_id', data?.viajeId) // Filtrar por el viaje actual
                    .eq('Estado', 'Completado');
                if (countMissionsError) console.error('Error al contar misiones del viaje:', countMissionsError);

                const { count: totalCompletedMissionsCount, error: countTotalMissionsError } = await supabase
                    .from('Viaje_Misiones') // Nombre de tabla correcto
                    .select('*', { count: 'exact' })
                    .eq('Viaje_id', data?.viajeId) // Filtrar por el viaje actual
                    .eq('Estado', 'Completado');
                if (countTotalMissionsError) console.error('Error al contar total de misiones completadas:', countTotalMissionsError);


                if (totalCompletedMissionsCount >= 10 && !achievedIds.includes(LOGROS.DIEZ_MISIONES.id)) {
                    newAchievements.push(LOGROS.DIEZ_MISIONES);
                }
                if (totalCompletedMissionsCount >= 100 && !achievedIds.includes(LOGROS.CIEN_MISIONES.id)) {
                    newAchievements.push(LOGROS.CIEN_MISIONES);
                }
                // Verificar Mapa Completo
                if (data?.Ciudad_id) {
                    const { count: totalMisionesCiudad } = await supabase
                        .from('Misiones') // Nombre de tabla correcto
                        .select('*', { count: 'exact' })
                        .eq('Ciudad_id', data.Ciudad_id);
                    const { count: completadasUsuarioCiudad } = await supabase
                        .from('Viaje_Misiones') // Nombre de tabla correcto
                        .select('*', { count: 'exact' })
                        .eq('Viaje_id', data?.viajeId)
                        .eq('Estado', 'Completado');
                    if (totalMisionesCiudad === completadasUsuarioCiudad && !achievedIds.includes(LOGROS.MAPA_COMPLETO.id)) {
                        newAchievements.push(LOGROS.MAPA_COMPLETO);
                    }
                }
                break;

            case 'VISIT_CITY':
                if (!achievedIds.includes(LOGROS.PRIMERA_CIUDAD.id)) {
                    newAchievements.push(LOGROS.PRIMERA_CIUDAD);
                }
                // Verificar conteo de ciudades visitadas
                const { count: visitedCitiesCount, error: countCitiesError } = await supabase
                    .from('Viajes') // Nombre de tabla correcto
                    .select('Ciudad_id', { count: 'distinct' })
                    .eq('Usuario_id', userId)
                    .neq('Fecha_final', null);
                if (countCitiesError) console.error('Error al contar ciudades:', countCitiesError);
                if (visitedCitiesCount >= 5 && !achievedIds.includes(LOGROS.TROTAMUNDOS.id)) {
                    newAchievements.push(LOGROS.TROTAMUNDOS);
                }
                if (visitedCitiesCount >= 15 && !achievedIds.includes(LOGROS.CIUDADANO_MUNDO.id)) {
                    newAchievements.push(LOGROS.CIUDADANO_MUNDO);
                }
                // Verificar "Bonjour, París"
                const parisCityId = '/* ID de París */'; // Reemplaza con el ID real de París
                const { data: parisData, error: parisError } = await supabase
                    .from('Ciudad')
                    .select('UUID')
                    .eq('Nombre_ciudad', 'París')
                    .single();
                if (parisError) console.error('Error al obtener ID de París:', parisError);
                const parisUUID = parisData?.UUID;

                if (data?.Ciudad_id === parisUUID && visitedCitiesCount >= 1 && !achievedIds.includes(LOGROS.BONJOUR_PARIS.id)) {
                    newAchievements.push(LOGROS.BONJOUR_PARIS);
                }
                break;

            case 'COMPLETE_TRAVEL':
                if (!achievedIds.includes(LOGROS.PRIMER_VIAJE.id)) {
                    newAchievements.push(LOGROS.PRIMER_VIAJE);
                }
                // Verificar conteo de viajes completados
                const { count: completedTravelsCount, error: countTravelsError } = await supabase
                    .from('Viajes') // Nombre de tabla correcto
                    .select('*', { count: 'exact' })
                    .eq('Usuario_id', userId)
                    .neq('Fecha_final', null);
                if (countTravelsError) console.error('Error al contar viajes:', countTravelsError);
                if (completedTravelsCount >= 5 && !achievedIds.includes(LOGROS.CINCO_VIAJES.id)) {
                    newAchievements.push(LOGROS.CINCO_VIAJES);
                }
                // Verificar "Misión fallida"
                const { count: completedMissionsInTravel } = await supabase
                    .from('Viaje_Misiones') // Nombre de tabla correcto
                    .select('*', { count: 'exact' })
                    .eq('Viaje_id', data.viajeId)
                    .eq('Estado', 'Completado');
                if (completedMissionsInTravel === 0 && !achievedIds.includes(LOGROS.MISION_FALLIDA.id)) {
                    newAchievements.push(LOGROS.MISION_FALLIDA);
                }
                break;

            case 'UPDATE_TRAVEL': // Para el logro de Planificador
                // Verificar conteo de viajes planificados (con fecha de inicio y fin)
                const { count: plannedTravelsCount, error: countPlannedTravelsError } = await supabase
                    .from('Viajes') // Nombre de tabla correcto
                    .select('*', { count: 'exact' })
                    .eq('Usuario_id', userId)
                    .neq('Fecha_inicio', null)
                    .neq('Fecha_final', null);
                if (countPlannedTravelsError) console.error('Error al contar viajes planificados:', countPlannedTravelsError);
                if (plannedTravelsCount >= 10 && !achievedIds.includes(LOGROS.DIEZ_VIAJES_PLANIFICADOS.id)) {
                    newAchievements.push(LOGROS.DIEZ_VIAJES_PLANIFICADOS);
                }
                break;

            case 'ADD_DIARY_ENTRY':
                if (data?.hasPhoto && !achievedIds.includes(LOGROS.PRIMERA_FOTO.id)) {
                    newAchievements.push(LOGROS.PRIMERA_FOTO);
                }
                if (data?.contentLength > 500 && !achievedIds.includes(LOGROS.HISTORIA_LARGA.id)) {
                    newAchievements.push(LOGROS.HISTORIA_LARGA);
                }
                // Verificar conteo total de entradas
                const { count: totalEntriesCount, error: countEntriesError } = await supabase
                    .from('Diario_Entradas') // Nombre de tabla correcto
                    .select('*', { count: 'exact' })
                    .eq('Usuario_id', userId);
                if (countEntriesError) console.error('Error al contar entradas del diario:', countEntriesError);
                if (totalEntriesCount >= 30 && !achievedIds.includes(LOGROS.TREINTA_ENTRADAS.id)) {
                    newAchievements.push(LOGROS.TREINTA_ENTRADAS);
                }
                // Verificar racha diaria (esto es más complejo y requiere lógica de fechas)
                // Podrías necesitar almacenar la fecha de la última entrada y verificar si las entradas son consecutivas
                // Placeholder:
                // if (/* racha de 5 días */ && !achievedIds.includes(LOGROS.RACHA_DIARIA.id)) {
                //     newAchievements.push(LOGROS.RACHA_DIARIA);
                // }
                break;

            case 'SEND_MESSAGE':
                // Lógica para PRIMER_MENSAJE y CINCO_AMIGOS necesitaría la implementación de mensajería y amigos
                break;

            case 'VALIDATE_IMAGE':
                // Verificar Precisión total (necesitas rastrear validaciones exitosas consecutivas)
                // Esto podría requerir almacenar un contador en el perfil del usuario o en otra tabla
                break;

            case 'CHECK_SPECIAL_ACHIEVEMENTS':
                // Viajero del tiempo
                const { data: viajesMismaCiudad, error: viajesError } = await supabase
                    .from('Viajes') // Nombre de tabla correcto
                    .select('Ciudad_id, EXTRACT(YEAR FROM Fecha_inicio) AS anio')
                    .eq('Usuario_id', userId)
                    .neq('Fecha_final', null);
                if (viajesError) console.error('Error al obtener viajes:', viajesError);
                const ciudadesVisitadasEnAnios = {};
                viajesMismaCiudad?.forEach(viaje => {
                    if (!ciudadesVisitadasEnAnios[viaje.Ciudad_id]) {
                        ciudadesVisitadasEnAnios[viaje.Ciudad_id] = new Set();
                    }
                    ciudadesVisitadasEnAnios[viaje.Ciudad_id].add(viaje.anio);
                });
                for (const ciudadId in ciudadesVisitadasEnAnios) {
                    if (ciudadesVisitadasEnAnios[ciudadId].size >= 2 && !achievedIds.includes(LOGROS.VIAJERO_DEL_TIEMPO.id)) {
                        newAchievements.push(LOGROS.VIAJERO_DEL_TIEMPO);
                        break; // Suponiendo que una vez es suficiente
                    }
                }

                // Coleccionista
                const achievedCategories = new Set(newAchievements.map(ach => ach.categoria));
                const allCategories = new Set(Object.values(LOGROS).map(logro => logro.categoria));
                let hasAllCategories = true;
                for (const cat of allCategories) {
                    if (!achievedCategories.has(cat)) {
                        hasAllCategories = false;
                        break;
                    }
                }
                if (hasAllCategories && !achievedIds.includes(LOGROS.COLECCIONISTA.id)) {
                    newAchievements.push(LOGROS.COLECCIONISTA);
                }
                break;

            // Lógica para "De arriba a abajo" requeriría rastrear la distancia recorrida en un viaje
        }

        // If there are new achievements, insert them and update points
        if (newAchievements.length > 0) {
            console.log(`🏆 Usuario ${userId} ha desbloqueado ${newAchievements.length} logros nuevos`);
            
            // First, ensure all achievements exist in the achievements table
            for (const achievement of newAchievements) {
                // Check if achievement exists in achievements table
                const { data: existingAchievement, error: checkError } = await supabase
                    .from('achievements')
                    .select('id')
                    .eq('id', achievement.id)
                    .single();
                
                if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
                    console.error(`Error checking achievement ${achievement.id}:`, checkError);
                    continue;
                }
                
                // If achievement doesn't exist, insert it
                if (!existingAchievement) {
                    const { error: insertAchievementError } = await supabase
                        .from('achievements')
                        .insert({
                            id: achievement.id,
                            title: achievement.nombre,
                            description: achievement.descripcion,
                            points: achievement.puntos,
                            code: achievement.id,
                            category: achievement.categoria,
                            icon: achievement.icono
                        });
                    
                    if (insertAchievementError) {
                        console.error(`Error inserting achievement ${achievement.id}:`, insertAchievementError);
                        continue;
                    }
                    
                    console.log(`✅ Achievement ${achievement.id} added to achievements table`);
                }
            }
            
            // Now insert user achievements
            const achievementsToInsert = newAchievements.map(logro => ({
                user_id: userId,
                achievement_id: logro.id,
                unlocked_at: new Date().toISOString()
            }));
        
            const { error: insertError } = await supabase
                .from('user_achievements')
                .insert(achievementsToInsert);
        
            if (insertError) throw insertError;
        
            // Update the user's level after earning achievements
            await updateUserLevel(userId);
            
            return { newAchievements, pointsEarned: newAchievements.reduce((sum, a) => sum + a.puntos, 0) };
        }

        return { newAchievements: [], pointsEarned: 0 };
    } catch (error) {
        console.error('Error al verificar logros:', error);
        throw error;
    }
};

/**
 * Obtener logros de un usuario
 */
export const getUserAchievements = async (userId) => {
    try {
        // Get user's unlocked achievements
        const { data: userAchievements, error: userAchievementsError } = await supabase
            .from('user_achievements')
            .select('achievement_id, unlocked_at')
            .eq('user_id', userId);

        if (userAchievementsError) throw userAchievementsError;
        
        return userAchievements || [];
    } catch (error) {
        console.error('Error al obtener logros del usuario:', error);
        throw error;
    }
};

/**
 * Obtener logros de un usuario para la API
 */
export const getUserAchievementsAPI = async (req, res) => {
    try {
        const { id_usuario } = req.params;

        const { data, error } = await supabase
            .from('Usuario_Logros') // Nombre de tabla correcto
            .select(`
                *,
                Logros (
                    UUID, // Nombre de columna correcto
                    Nombre_logro, // Nombre de columna correcto
                    Descripcion,
                    icono_url, // Nombre de columna correcto
                    Puntos_recompensa // Nombre de columna correcto
                )
            `)
            .eq('Usuario_id', id_usuario) // Nombre de columna correcto
            .order('Conseguido_en', { ascending: false }); // Nombre de columna correcto

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener logros del usuario',
            error: error.message
        });
    }
};