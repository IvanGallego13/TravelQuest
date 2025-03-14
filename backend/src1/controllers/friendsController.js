import supabase from '../config/supabaseClient.js';

// Agregar amigo
export const addFriend = async (req, res) => {
    const { id_usuario_amigo, id_usuario_king } = req.body;

    const { data, error } = await supabase
        .from('Amigos')
        .insert([{ id_usuario_amigo, id_usuario_king }])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ message: 'Amigo agregado', data });
};

// Obtener lista de amigos
export const getFriends = async (req, res) => {
    const { id_usuario } = req.params;

    const { data, error } = await supabase
        .from('Amigos')
        .select('*')
        .or(`id_usuario_amigo.eq.${id_usuario},id_usuario_king.eq.${id_usuario}`);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
};
