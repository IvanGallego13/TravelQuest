import supabase from '../config/supabaseClient.js';

/**
 * Agregar una nueva misión para un usuario
 */
export const addMission = async (req, res) => {
    const { id_usuario, descripcion_mision, ubicacion, dificultad } = req.body;

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .insert([{ id_usuario, descripcion_mision, ubicacion, dificultad }])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ message: 'Misión creada correctamente', data });
};

/**
 * Obtener todas las misiones de un usuario
 */
export const getMissions = async (req, res) => {
    const { id_usuario } = req.params;

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .select('*')
        .eq('id_usuario', id_usuario);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
};

/**
 * Actualizar una misión
 */
export const updateMission = async (req, res) => {
    const { id_mision } = req.params;
    const { descripcion_mision, ubicacion, dificultad } = req.body;

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .update({ descripcion_mision, ubicacion, dificultad })
        .eq('id_mision', id_mision)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Misión actualizada correctamente', data });
};

/**
 * Eliminar una misión
 */
export const deleteMission = async (req, res) => {
    const { id_mision } = req.params;

    const { error } = await supabase
        .from('Historial_Misiones')
        .delete()
        .eq('id_mision', id_mision);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Misión eliminada correctamente' });
};
