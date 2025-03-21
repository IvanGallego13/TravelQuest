import supabase from '../config/supabaseClient.js';

/**
 * Enviar solicitud de amistad (POST /amigos)
 */
export const sendFriendRequest = async (req, res) => {
    const { id_usuario_amigo, id_usuario_king } = req.body;

    const { data, error } = await supabase
        .from('Amigos')
        .insert([{ id_usuario_amigo, id_usuario_king, aceptado: false }])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ message: 'Solicitud de amistad enviada', data });
};

/**
 * Aceptar solicitud de amistad (PUT /amigos/:id/accept)
 */
export const acceptFriendRequest = async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('Amigos')
        .update({ aceptado: true })
        .eq('id_amigo', id)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Solicitud de amistad aceptada', data });
};

/**
 * Eliminar amistad (DELETE /amigos/:id)
 */
export const deleteFriend = async (req, res) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('Amigos')
        .delete()
        .eq('id_amigo', id);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Amigo eliminado correctamente' });
};

/**
 * Obtener lista de amigos (GET /amigos)
 */
export const getAllFriends = async (req, res) => {
    const userId = req.user?.id;

    const { data, error } = await supabase
        .from('Amigos')
        .select('*')
        .or(`id_usuario_amigo.eq.${userId},id_usuario_king.eq.${userId}`);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
};

/**
 * Obtener un amigo por ID (GET /amigos/:id)
 */
export const getFriendById = async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('Amigos')
        .select('*')
        .eq('id_amigo', id)
        .single();

    if (error) return res.status(404).json({ error: 'Amigo no encontrado' });

    res.json(data);
};
