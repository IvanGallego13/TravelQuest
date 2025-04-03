import { supabase } from '../../config/supabaseClient.js';

export const amigosController = {
    /**
     * Enviar solicitud de amistad (POST /amigos)
     */
    sendFriendRequest: async (req, res) => {
        try {
            const { id_usuario_amigo, id_usuario_king } = req.body;

            const { data, error } = await supabase
                .from('Amigos')
                .insert([{ id_usuario_amigo, id_usuario_king, aceptado: false }])
                .select();

            if (error) throw error;

            res.status(201).json({ message: 'Solicitud de amistad enviada', data });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Aceptar solicitud de amistad (PUT /amigos/:id/accept)
     */
    acceptFriendRequest: async (req, res) => {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('Amigos')
                .update({ aceptado: true })
                .eq('id_amigo', id)
                .select();

            if (error) throw error;

            res.json({ message: 'Solicitud de amistad aceptada', data });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Eliminar amistad (DELETE /amigos/:id)
     */
    deleteFriend: async (req, res) => {
        try {
            const { id } = req.params;

            const { error } = await supabase
                .from('Amigos')
                .delete()
                .eq('id_amigo', id);

            if (error) throw error;

            res.json({ message: 'Amigo eliminado correctamente' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Obtener lista de amigos (GET /amigos)
     */
    getAllFriends: async (req, res) => {
        try {
            const userId = req.user?.id;

            const { data, error } = await supabase
                .from('Amigos')
                .select('*')
                .or(`id_usuario_amigo.eq.${userId},id_usuario_king.eq.${userId}`);

            if (error) throw error;

            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Obtener un amigo por ID (GET /amigos/:id)
     */
    getFriendById: async (req, res) => {
        try {
            const { id } = req.params;

            const { data, error } = await supabase
                .from('Amigos')
                .select('*')
                .eq('id_amigo', id)
                .single();

            if (error) {
                return res.status(404).json({ message: 'Amigo no encontrado' });
            }

            res.json(data);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};
