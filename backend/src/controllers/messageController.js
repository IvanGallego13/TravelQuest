import supabase from '../config/supabaseClient.js';

// Enviar mensaje
export const sendMessage = async (req, res) => {
    const { id_emisor, id_receptor, contenido } = req.body;

    const { data, error } = await supabase
        .from('Mensajes')
        .insert([{ id_emisor, id_receptor, contenido }])
        .select();

    if (error) return res.status(500).json({ error: error.message });

    res.status(201).json({ message: 'Mensaje enviado', data });
};

// Obtener mensajes entre dos usuarios
export const getMessages = async (req, res) => {
    const { id_emisor, id_receptor } = req.params;

    const { data, error } = await supabase
        .from('Mensajes')
        .select('*')
        .or(`id_emisor.eq.${id_emisor},id_receptor.eq.${id_receptor}`);

    if (error) return res.status(500).json({ error: error.message });

    res.json(data);
};
