import supabase from '../config/supabaseClient.js';

/**
 * Obtener el ranking de los usuarios
 */
export const getRanking = async (req, res) => {
    const { data, error } = await supabase
        .from('Ranking')
        .select('id_usuario, posicion')
        .order('posicion', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
};

/**
 * Actualizar el ranking de un usuario
 */
export const updateRanking = async (req, res) => {
    const { id_usuario } = req.params;
    const { posicion } = req.body;

    const { data, error } = await supabase
        .from('Ranking')
        .update({ posicion })
        .eq('id_usuario', id_usuario)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Ranking actualizado correctamente', data });
};
