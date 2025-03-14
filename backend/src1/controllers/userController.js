import supabase from '../config/supabaseClient.js';

// Registrar usuario
export const registerUser = async (req, res) => {
    const { nombre, correo, contraseña, foto_perfil, ultima_ubicacion, nivel, estado } = req.body;

    const { data, error } = await supabase
        .from('Usuario')
        .insert([{ nombre, correo, contraseña, foto_perfil, ultima_ubicacion, nivel, estado }])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ message: 'Usuario registrado correctamente', data });
};

// Obtener usuario por ID
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
