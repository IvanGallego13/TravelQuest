import supabase from '../config/supabaseClient.js';

// Agregar un diario de viaje
export const addDiaryEntry = async (req, res) => {
    const { id_usuario, id_ciudad, titulo, descripcion, fecha_viaje } = req.body;

    const { data, error } = await supabase
        .from('Diario')
        .insert([{ id_usuario, id_ciudad, titulo, descripcion, fecha_viaje }])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ message: 'Diario creado correctamente', data });
};

// Obtener los diarios de un usuario
export const getUserDiary = async (req, res) => {
    const { id_usuario } = req.params;

    const { data, error } = await supabase
        .from('Diario')
        .select('*')
        .eq('id_usuario', id_usuario);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
};
