import supabase from '../config/supabaseClient.js';

// Obtener ranking de usuarios
export const getRanking = async (req, res) => {
    const { data, error } = await supabase
        .from('Ranking')
        .select('id_usuario, posicion')
        .order('posicion', { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
};
