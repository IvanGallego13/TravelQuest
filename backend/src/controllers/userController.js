import supabase from '../config/supabaseClient.js';

/**
 * Obtener usuario por ID
 */
export const getUser = async (req, res) => {
    const { id_usuario } = req.params;

    const { data, error } = await supabase
        .from('Usuario')
        .select('*')
        .eq('id_usuario', id_usuario)
        .single();

    if (error) return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json(data);
};

/**
 * Actualizar perfil del usuario
 */
export const updateUser = async (req, res) => {
    const { id_usuario } = req.params;
    const { nombre, foto_perfil, ultima_ubicacion, nivel, estado } = req.body;

    const { data, error } = await supabase
        .from('Usuario')
        .update({ nombre, foto_perfil, ultima_ubicacion, nivel, estado })
        .eq('id_usuario', id_usuario)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Perfil actualizado correctamente', data });
};
