import { supabase } from '../../config/supabaseClient.js';

/**
 * Enviar mensaje entre usuarios
 */
export const sendMessage = async (req, res) => {
    const { id_emisor, id_receptor, contenido } = req.body;

    const { data, error } = await supabase
        .from('Mensajes')
        .insert([{ id_emisor, id_receptor, contenido }])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ message: 'Mensaje enviado', data });
};

/**
 * Obtener mensajes entre dos usuarios
 */
export const getMessages = async (req, res) => {
    const { id_emisor, id_receptor } = req.params;

    const { data, error } = await supabase
        .from('Mensajes')
        .select('*')
        .or(`id_emisor.eq.${id_emisor},id_receptor.eq.${id_receptor}`);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
};

/**
 * Marcar un mensaje como leído
 */
export const markMessageAsRead = async (req, res) => {
    const { id_mensaje } = req.params;

    const { data, error } = await supabase
        .from('Mensajes')
        .update({ leido: true })
        .eq('id_mensaje', id_mensaje)
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Mensaje marcado como leído', data });
};

/**
 * Eliminar un mensaje
 */
export const deleteMessage = async (req, res) => {
    const { id_mensaje } = req.params;

    const { error } = await supabase
        .from('Mensajes')
        .delete()
        .eq('id_mensaje', id_mensaje);

    if (error) return res.status(500).json({ error: error.message });

    res.json({ message: 'Mensaje eliminado correctamente' });
};

/**
 * Obtener todos los mensajes de un usuario (emisor o receptor)
 */
export const getAllMessagesForUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const { data, error } = await supabase
            .from('Mensajes')
            .select('*')
            .or(`id_emisor.eq.${userId},id_receptor.eq.${userId}`);
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
