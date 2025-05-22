import { supabase } from '../config/supabaseClient.js';
import { randomUUID } from 'crypto';

// Función para formatear IDs a formato UUID válido
function formatToValidUUID(id) {
  // Si ya es un UUID válido, devolverlo tal cual
  if (typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  
  // Devolver el ID original, esperando que sea un ID válido en la base de datos
  console.log(`⚠️ ID no válido como UUID pero usando sin modificar: '${id}'`);
  return id;
}

// Crear conversación entre dos usuarios (si no existe)
export const createConversation = async (req, res) => {
  // Permitir que los datos vengan como user1/user2 o user_id1/user_id2
  const { user1, user2, user_id1, user_id2 } = req.body;
  
  // Usar los valores que vengan, con preferencia por user_id1/user_id2
  let id1 = user_id1 || user1;
  let id2 = user_id2 || user2;
  
  console.log("📩 Creando conversación entre usuarios originales:", id1, "y", id2);
  
  if (!id1 || !id2) {
    console.error("❌ Error: Faltan usuarios en la solicitud", { user1, user2, user_id1, user_id2 });
    return res.status(400).json({ error: 'Faltan usuarios' });
  }

  try {
    // Formatear IDs como UUIDs válidos
    const formattedId1 = formatToValidUUID(id1);
    const formattedId2 = formatToValidUUID(id2);
    
    console.log("🧩 IDs formateados como UUID:", formattedId1, formattedId2);
    
    // Verificar que los usuarios existen
    const { data: user1Data, error: user1Error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', formattedId1)
      .single();
      
    if (user1Error || !user1Data) {
      console.error("❌ Usuario 1 no encontrado:", formattedId1);
      return res.status(404).json({ error: `Usuario con ID ${id1} no encontrado.` });
    }
    
    const { data: user2Data, error: user2Error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', formattedId2)
      .single();
      
    if (user2Error || !user2Data) {
      console.error("❌ Usuario 2 no encontrado:", formattedId2);
      return res.status(404).json({ error: `Usuario con ID ${id2} no encontrado.` });
    }
    
    // Comprobar si ya existe una conversación entre estos usuarios
    console.log("🔍 Buscando conversación existente entre usuarios:", formattedId1, formattedId2);
    const { data: existingConv, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user_1_id.eq.${formattedId1},user_2_id.eq.${formattedId2}),and(user_1_id.eq.${formattedId2},user_2_id.eq.${formattedId1})`)
      .maybeSingle();
      
    if (convError) {
      console.error("❌ Error al buscar conversación:", convError);
      return res.status(500).json({ error: convError.message });
    }
    
    // Si ya existe una conversación, devolver su ID
    if (existingConv) {
      console.log("✅ Conversación existente encontrada:", existingConv);
      return res.status(200).json({ 
        id: existingConv.id,
        user_1_id: formattedId1,
        user_2_id: formattedId2,
        message: 'Conversación existente recuperada' 
      });
    }
    
    // Si no existe, crear una nueva conversación
    console.log("🔨 Creando nueva conversación entre:", formattedId1, "y", formattedId2);
    
    const { data, error } = await supabase
      .from('conversations')
      .insert([{ 
        user_1_id: formattedId1, 
        user_2_id: formattedId2
      }])
      .select();
      
    if (error) {
      console.error("❌ Error al crear conversación:", error);
      return res.status(500).json({ error: error.message });
    }
    
    console.log("✅ Conversación creada con éxito:", data);
    res.status(201).json(data[0]);
  } catch (err) {
    console.error("❌ Error general al crear conversación:", err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener detalles de una conversación específica
export const getConversationDetails = async (req, res) => {
  const { id } = req.params;
  
  console.log("🔍 Obteniendo detalles de conversación:", id);
  
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('id, user_1_id, user_2_id, created_at')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("❌ Error al obtener conversación:", error);
      return res.status(500).json({ error: error.message });
    }
    
    if (!data) {
      console.error("❌ Conversación no encontrada:", id);
      return res.status(404).json({ error: 'Conversación no encontrada' });
    }
    
    console.log("✅ Conversación obtenida:", data);
    res.json(data);
  } catch (err) {
    console.error("❌ Error general al obtener conversación:", err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener todas las conversaciones de un usuario
export const getUserConversations = async (req, res) => {
  const { userId } = req.params;
  
  console.log("🔍 Obteniendo conversaciones del usuario:", userId);
  
  try {
    // Buscar conversaciones donde el usuario es cualquiera de los participantes
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select('id, user_1_id, user_2_id, created_at')
      .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`);
      
    if (conversationsError) {
      console.error("❌ Error al obtener conversaciones:", conversationsError);
      return res.status(500).json({ error: conversationsError.message });
    }
    
    console.log(`✅ Encontradas ${conversationsData.length} conversaciones para el usuario`);
    
    // Para cada conversación, obtener los datos del otro usuario
    const conversationsWithUserData = await Promise.all(conversationsData.map(async (conv) => {
      // Determinar cuál es el otro usuario en la conversación
      const otherUserId = conv.user_1_id === userId ? conv.user_2_id : conv.user_1_id;
      
      // Obtener datos del otro usuario
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, score')
        .eq('id', otherUserId)
        .single();
        
      if (userError || !userData) {
        console.error(`❌ Error al obtener datos del usuario ${otherUserId}:`, userError);
        return {
          ...conv,
          user: { id: otherUserId, nombre: 'Usuario desconocido' }
        };
      }
      
      // Obtener el último mensaje de la conversación
      const { data: lastMessageData, error: lastMessageError } = await supabase
        .from('messages')
        .select('content, sent_at, sender_id')
        .eq('conversation_id', conv.id)
        .order('sent_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      // Formatear la respuesta según lo esperado por el frontend
      return {
        id: conv.id.toString(),
        user: {
          id: userData.id,
          nombre: userData.username,
          foto_perfil: userData.avatar_url,
          nivel: userData.score || 0,
          username: userData.username
        },
        lastMessage: lastMessageData ? lastMessageData.content : '',
        lastDate: lastMessageData ? lastMessageData.sent_at : conv.created_at,
        unread: 0 // Esto requeriría una consulta adicional para contar mensajes no leídos
      };
    }));
    
    res.json(conversationsWithUserData);
  } catch (err) {
    console.error("❌ Error general al obtener conversaciones de usuario:", err);
    res.status(500).json({ error: err.message });
  }
}; 