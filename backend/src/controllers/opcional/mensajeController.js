import { supabase } from '../../config/supabaseClient.js';
import { randomUUID } from 'crypto';

// Función para formatear IDs a formato UUID válido
function formatToValidUUID(id) {
  // Si ya es un UUID válido, devolverlo tal cual
  if (typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  
  // Si es un número simple, convertirlo a un UUID predecible basado en el número
  if (typeof id === 'string' && !isNaN(Number(id)) || typeof id === 'number') {
    const strId = String(id).padStart(12, '0');
    const uuid = `00000000-0000-4000-a000-${strId}`;
    console.log(`🔄 Convertido ID simple ${id} a UUID: ${uuid}`);
    return uuid;
  }
  
  // Para otros valores, intentar generar un UUID v4 aleatorio
  console.error(`⚠️ ID no válido recibido: '${id}', tipo: ${typeof id}. Generando UUID aleatorio.`);
  try {
    return randomUUID();
  } catch (err) {
    // Como respaldo, generar un UUID con timestamp
    const timestamp = Date.now().toString().padStart(12, '0').substring(0, 12);
    return `00000000-0000-4000-a000-${timestamp}`;
  }
}

/**
 * Enviar mensaje entre usuarios
 */
export const sendMessage = async (req, res) => {
    const { sender_id, receiver_id, contenido, conversation_id } = req.body;
    
    console.log("📤 Enviando mensaje:", { 
        emisor: sender_id, 
        receptor: receiver_id,
        conversacion: conversation_id,
        contenido: contenido?.substring(0, 20) + (contenido?.length > 20 ? '...' : '')
    });

    if (!sender_id || !receiver_id || !contenido) {
        console.error("❌ Faltan datos para enviar mensaje");
        return res.status(400).json({ error: 'Faltan datos obligatorios (emisor, receptor, contenido)' });
    }

    try {
        // Formatear IDs como UUIDs válidos
        const emisorUUID = formatToValidUUID(sender_id);
        const receptorUUID = formatToValidUUID(receiver_id);
        
        console.log("🧩 IDs formateados como UUID:", emisorUUID, receptorUUID);
        
        // Primero validar que ambos usuarios existen
        console.log("🔍 Verificando existencia del emisor:", emisorUUID);
        const { data: emisorData, error: emisorError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', emisorUUID)
            .maybeSingle();
            
        if (emisorError || !emisorData) {
            console.error("❌ Emisor no encontrado:", emisorUUID);
            return res.status(404).json({ error: `Usuario emisor con ID ${sender_id} no encontrado. Debes usar un ID de usuario existente.` });
        }
        
        console.log("🔍 Verificando existencia del receptor:", receptorUUID);
        const { data: receptorData, error: receptorError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', receptorUUID)
            .maybeSingle();
            
        if (receptorError || !receptorData) {
            console.error("❌ Receptor no encontrado:", receptorUUID);
            return res.status(404).json({ error: `Usuario receptor con ID ${receiver_id} no encontrado. Debes usar un ID de usuario existente.` });
        }
        
        // Si se proporciona la conversation_id, verificar que existe
        let conversationId = conversation_id;
        
        if (conversationId) {
            console.log("🔍 Verificando existencia de la conversación:", conversationId);
            const { data: convData, error: convError } = await supabase
                .from('conversations')
                .select('id')
                .eq('id', conversationId)
                .maybeSingle();
                
            if (convError || !convData) {
                console.error("❌ Conversación no encontrada:", convError || "No existe");
                // Si no existe, ponemos el ID a null para crear una nueva
                conversationId = null;
            }
        }
        
        // Preparar los datos del mensaje
        const messageData = { 
            sender_id: emisorData.id, 
            receiver_id: receptorData.id, 
            contenido 
        };
        
        // Agregar ID de conversación si existe
        if (conversationId) {
            messageData.conversation_id = conversationId;
        }
        
        console.log("📩 Insertando mensaje con datos:", messageData);
        
        const { data, error } = await supabase
            .from('messages')
            .insert([messageData])
            .select();

        if (error) {
            console.error("❌ Error al insertar mensaje:", error);
            return res.status(500).json({ error: error.message });
        }

        console.log("✅ Mensaje enviado con éxito");
        res.status(201).json({ message: 'Mensaje enviado', data });
    } catch (err) {
        console.error("❌ Error inesperado al enviar mensaje:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Obtener mensajes entre dos usuarios
 */
export const getMessages = async (req, res) => {
    const { id_emisor, id_receptor } = req.params;

    console.log(`🔍 Buscando mensajes entre ${id_emisor} y ${id_receptor}`);

    // Comprobar si es un ID de conversación (un solo parámetro)
    if (id_emisor && !id_receptor) {
        const conversationId = id_emisor;
        console.log(`🔍 Detectado ID de conversación: ${conversationId}`);
        
        try {
            // Primero obtener la conversación para saber los usuarios
            const { data: conversation, error: convError } = await supabase
                .from('conversations')
                .select('*')
                .eq('id', conversationId)
                .single();
                
            if (convError) {
                console.error("❌ Error al obtener la conversación:", convError);
                return res.status(500).json({ error: convError.message });
            }
            
            if (!conversation) {
                return res.status(404).json({ error: 'Conversación no encontrada' });
            }
            
            // Determinar los nombres de campos de usuario en la tabla de conversaciones
            let user1Field = 'user_1_id';
            let user2Field = 'user_2_id';
            
            // Comprobar qué campos existen en la conversación
            if (conversation.user_id1 !== undefined) {
                user1Field = 'user_id1';
                user2Field = 'user_id2';
            } else if (conversation.user1 !== undefined) {
                user1Field = 'user1';
                user2Field = 'user2';
            }
            
            const user1 = conversation[user1Field];
            const user2 = conversation[user2Field];
            
            console.log(`🔍 Usuarios en conversación: ${user1} y ${user2}`);
            
            // Buscar mensajes entre estos dos usuarios
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user1},receiver_id.eq.${user2}),and(sender_id.eq.${user2},receiver_id.eq.${user1})`)
                .order('created_at', { ascending: true });
                
            if (error) {
                console.error("❌ Error al obtener mensajes:", error);
                return res.status(500).json({ error: error.message });
            }
            
            console.log(`✅ Encontrados ${data.length} mensajes`);
            return res.json(data);
        } catch (err) {
            console.error("❌ Error general:", err);
            return res.status(500).json({ error: err.message });
        }
    }
    
    // Comportamiento original: búsqueda por emisor/receptor
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${id_emisor},receiver_id.eq.${id_receptor}),and(sender_id.eq.${id_receptor},receiver_id.eq.${id_emisor})`)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("❌ Error al obtener mensajes entre usuarios:", error);
        return res.status(500).json({ error: error.message });
    }
    
    console.log(`✅ Encontrados ${data.length} mensajes entre ${id_emisor} y ${id_receptor}`);
    res.json(data);
};

/**
 * Marcar un mensaje como leído
 */
export const markMessageAsRead = async (req, res) => {
    const { id_mensaje } = req.params;

    const { data, error } = await supabase
        .from('messages')
        .update({ leido: true })
        .eq('id', id_mensaje)
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
        .from('messages')
        .delete()
        .eq('id', id_mensaje);

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
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
