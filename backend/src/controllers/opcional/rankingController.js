import supabase from '../../config/supabaseClient.js';

// Definir los niveles de dificultad y sus puntos (manteniendo consistencia con generateMission.js)
const DIFFICULTY_POINTS = {
    "facil": 100,
    "medio": 200,
    "dificil": 300
};

/**
 * Obtener el ranking global de usuarios
 */
export const getGlobalRanking = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Usuarios')
            .select(`
                id,
                nombre,
                puntos_totales,
                misiones_completadas,
                nivel_actual
            `)
            .order('puntos_totales', { ascending: false })
            .limit(100); // Limitamos a los top 100 para mejor rendimiento

        if (error) throw error;

        // Añadir posición en el ranking
        const rankingData = data.map((user, index) => ({
            ...user,
            posicion: index + 1
        }));

        res.json(rankingData);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al obtener el ranking global',
            error: error.message 
        });
    }
};

/**
 * Obtener el ranking de amigos de un usuario
 */
export const getFriendsRanking = async (req, res) => {
    const { id_usuario } = req.params;

    try {
        // Primero obtenemos la lista de amigos del usuario
        const { data: amigos, error: amigosError } = await supabase
            .from('Amigos')
            .select('id_amigo')
            .eq('id_usuario', id_usuario);

        if (amigosError) throw amigosError;

        // Obtenemos los datos de ranking de los amigos
        const idAmigos = amigos.map(a => a.id_amigo);
        const { data: rankingAmigos, error: rankingError } = await supabase
            .from('Usuarios')
            .select(`
                id,
                nombre,
                puntos_totales,
                misiones_completadas,
                nivel_actual
            `)
            .in('id', idAmigos)
            .order('puntos_totales', { ascending: false });

        if (rankingError) throw rankingError;

        // Añadir posición en el ranking
        const rankingData = rankingAmigos.map((user, index) => ({
            ...user,
            posicion: index + 1
        }));

        res.json(rankingData);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al obtener el ranking de amigos',
            error: error.message 
        });
    }
};

/**
 * Actualizar los puntos de un usuario al completar una misión
 */
export const updateUserPoints = async (req, res) => {
    const { id_usuario } = req.params;
    const { dificultad_mision } = req.body;

    try {
        // Validar que la dificultad sea válida
        if (!DIFFICULTY_POINTS[dificultad_mision]) {
            return res.status(400).json({
                message: 'Dificultad no válida'
            });
        }

        // Obtener datos actuales del usuario
        const { data: userData, error: userError } = await supabase
            .from('Usuarios')
            .select('puntos_totales, misiones_completadas, nivel_actual')
            .eq('id', id_usuario)
            .single();

        if (userError) throw userError;

        // Calcular nuevos valores
        const puntosGanados = DIFFICULTY_POINTS[dificultad_mision];
        const nuevosPuntosTotales = userData.puntos_totales + puntosGanados;
        const nuevasMisionesCompletadas = userData.misiones_completadas + 1;
        
        // Calcular nuevo nivel (cada 1000 puntos se sube de nivel)
        const nuevoNivel = Math.floor(nuevosPuntosTotales / 1000) + 1;

        // Actualizar datos del usuario
        const { data, error } = await supabase
            .from('Usuarios')
            .update({
                puntos_totales: nuevosPuntosTotales,
                misiones_completadas: nuevasMisionesCompletadas,
                nivel_actual: nuevoNivel
            })
            .eq('id', id_usuario)
            .select();

        if (error) throw error;

        res.json({
            message: 'Puntos actualizados correctamente',
            data: {
                ...data[0],
                puntos_ganados: puntosGanados,
                subio_nivel: nuevoNivel > userData.nivel_actual
            }
        });

    } catch (error) {
        res.status(500).json({ 
            message: 'Error al actualizar los puntos',
            error: error.message 
        });
    }
};
