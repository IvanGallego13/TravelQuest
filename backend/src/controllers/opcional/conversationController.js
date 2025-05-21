import { supabase } from '../../config/supabaseClient.js';

// Crear conversación entre dos usuarios (si no existe)
export const createConversation = async (req, res) => {
  const { user1, user2 } = req.body;
  if (!user1 || !user2) return res.status(400).json({ error: 'Faltan usuarios' });
  try {
    // Buscar si ya existe
    const { data: existing, error: findError } = await supabase
      .from('conversations')
      .select('*')
      .or(`(user1.eq.${user1},user2.eq.${user2}),(user1.eq.${user2},user2.eq.${user1})`)
      .maybeSingle();
    if (findError) return res.status(500).json({ error: findError.message });
    if (existing) return res.json(existing);
    // Crear nueva conversación
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ user1, user2 }])
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener conversaciones activas de un usuario
export const getUserConversations = async (req, res) => {
  const { userId } = req.params;
  try {
    // Buscar conversaciones donde el usuario es user1 o user2
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`user1.eq.${userId},user2.eq.${userId}`);
    if (error) return res.status(500).json({ error: error.message });
    // Para cada conversación, obtener el otro usuario y el último mensaje
    const result = [];
    for (const conv of conversations) {
      const otherId = conv.user1 === userId ? conv.user2 : conv.user1;
      // Obtener datos del otro usuario
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id, username as nombre, avatar_url as foto_perfil')
        .eq('id', otherId);
      if (userError) continue;
      // Obtener último mensaje
      const { data: lastMsg, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1);
      // Contar mensajes no leídos
      const { count: unread } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('receiver_id', userId)
        .eq('leido', false);
      result.push({
        id: conv.id,
        user: users[0],
        lastMessage: lastMsg && lastMsg.length > 0 ? lastMsg[0].content : '',
        lastDate: lastMsg && lastMsg.length > 0 ? lastMsg[0].created_at : '',
        unread: unread || 0,
      });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 