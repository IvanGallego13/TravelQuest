import supabase from '../config/supabaseClient.js';

/**
 * Agregar una entrada de diario
 */
export const addDiaryEntry = async (req, res) => {
    const { id_usuario, id_ciudad, titulo, descripcion, fecha_viaje } = req.body;

    const { data, error } = await supabase
        .from('Diario')
        .insert([{ id_usuario, id_ciudad, titulo, descripcion, fecha_viaje }])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ message: 'Diario creado correctamente', data });
};

/**
 * Obtener los diarios de un usuario
 */
export const getUserDiary = async (req, res) => {
    const { id_usuario } = req.params;

    const { data, error } = await supabase
        .from('Diario')
        .select('*')
        .eq('id_usuario', id_usuario);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
};

/**
 * Actualizar una entrada de diario
 */
export const updateDiaryEntry = async (req, res) => {
    const { id_diario } = req.params;
    const { titulo, descripcion, fecha_viaje } = req.body;

    const { data, error } = await supabase
        .from('Diario')
        .update({ titulo, descripcion, fecha_viaje })
        .eq('id_diario', id_diario)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Diario actualizado correctamente', data });
};

/**
 * Eliminar una entrada de diario
 */
export const deleteDiaryEntry = async (req, res) => {
    const { id_diario } = req.params;

    const { error } = await supabase
        .from('Diario')
        .delete()
        .eq('id_diario', id_diario);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Diario eliminado correctamente' });
};
