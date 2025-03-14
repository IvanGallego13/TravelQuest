import supabase from '../config/supabaseClient.js';

// Agregar misión
export const addMission = async (req, res) => {
    const { id_usuario, descripcion_mision, ubicacion, dificultad } = req.body;

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .insert([{ id_usuario, descripcion_mision, ubicacion, dificultad }])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ message: 'Misión creada correctamente', data });
};

// Obtener misiones de un usuario
export const getMissions = async (req, res) => {
    const { id_usuario } = req.params;

    const { data, error } = await supabase
        .from('Historial_Misiones')
        .select('*')
        .eq('id_usuario', id_usuario);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
};
