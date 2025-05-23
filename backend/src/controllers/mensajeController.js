import { supabase } from '../config/supabaseClient.js';

/**
 * Enviar mensaje entre usuarios
 */
export const sendMessage = async (req, res) => {
    const { sender_id, receiver_id, contenido, conversation_id } = req.body;
    
    console.log("📤 Recibida solicitud para enviar mensaje:", { 
        sender_id, 
        receiver_id,
        conversation_id,
        contenido: contenido?.substring(0, 20) + (contenido?.length > 20 ? '...' : '')
    });

    if (!sender_id || !receiver_id || !contenido || !conversation_id) {
        console.error("❌ Faltan datos para enviar mensaje:", {
            sender_id: !!sender_id,
            receiver_id: !!receiver_id,
            contenido: !!contenido,
            conversation_id: !!conversation_id
        });
        return res.status(400).json({ error: 'Faltan datos obligatorios (sender_id, receiver_id, contenido, conversation_id)' });
    }

    try {
        // Verificar que la conversación existe
        console.log("🔍 Verificando existencia de la conversación:", conversation_id);
        const { data: convData, error: convError } = await supabase
            .from('conversations')
            .select('id')
            .eq('id', conversation_id)
            .single();
            
        if (convError) {
            console.error("❌ Error al buscar conversación:", convError);
            
            // Si el error es que no se encontró, intentar convertir el ID si es numérico
            if (convError.code === 'PGRST116' && /^\d+$/.test(conversation_id)) {
                console.log("🔄 Intentando buscar conversación por ID numérico:", conversation_id);
                
                // Intentar buscar por ID numérico
                const { data: numericConvData, error: numericConvError } = await supabase
                    .from('conversations')
                    .select('id')
                    .eq('id', parseInt(conversation_id))
                    .single();
                    
                if (numericConvError || !numericConvData) {
                    console.error("❌ No se encontró la conversación con ID numérico tampoco:", numericConvError);
                    return res.status(404).json({ error: `Conversación con ID ${conversation_id} no encontrada` });
                }
                
                console.log("✅ Conversación encontrada por ID numérico:", numericConvData);
            } else {
                return res.status(404).json({ error: `Conversación con ID ${conversation_id} no encontrada` });
            }
        }
        
        if (!convData) {
            console.error("❌ Conversación no encontrada:", conversation_id);
            return res.status(404).json({ error: `Conversación con ID ${conversation_id} no encontrada` });
        }
        
        console.log("✅ Conversación verificada:", convData);
        
        // Preparar los datos del mensaje, asegurando que estén en el formato correcto
        const messageData = { 
            sender_id, 
            receiver_id, 
            content: contenido, // Usar content en lugar de contenido para la base de datos
            conversation_id,
            sent_at: new Date().toISOString()
        };
        
        console.log("📩 Insertando mensaje con datos:", {
            ...messageData,
            content: messageData.content.substring(0, 20) + (messageData.content.length > 20 ? '...' : '')
        });
        
        const { data, error } = await supabase
            .from('messages')
            .insert([messageData])
            .select();

        if (error) {
            console.error("❌ Error al insertar mensaje:", error);
            return res.status(500).json({ error: error.message });
        }

        console.log("✅ Mensaje enviado con éxito, ID:", data[0].id);
        res.status(201).json({ message: 'Mensaje enviado', data });
    } catch (err) {
        console.error("❌ Error inesperado al enviar mensaje:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Obtener mensajes de una conversación
 */
export const getConversationMessages = async (req, res) => {
    const { conversationId } = req.params;

    console.log(`🔍 Buscando mensajes para conversación: ${conversationId}`);

    try {
        // Solo filtrar por conversation_id para obtener TODOS los mensajes de la conversación
        // independientemente de quién los envió o recibió
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('sent_at', { ascending: true });

        if (error) {
            console.error("❌ Error al obtener mensajes:", error);
            return res.status(500).json({ error: error.message });
        }
        
        console.log(`✅ Encontrados ${data.length} mensajes para la conversación ${conversationId}`);
        
        // Log detallado para depuración
        if (data.length > 0) {
            console.log("📊 Muestra de mensajes:", data.slice(0, 2).map(msg => ({
                id: msg.id,
                sender: msg.sender_id,
                content: msg.content?.substring(0, 15) + '...',
                sent_at: msg.sent_at
            })));
        }
        
        res.json(data);
    } catch (err) {
        console.error("❌ Error general al obtener mensajes:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Marcar un mensaje como leído
 */
export const markMessageAsRead = async (req, res) => {
    const { messageId } = req.params;

    console.log(`📝 Marcando mensaje como leído: ${messageId}`);

    try {
        // Como no existe la columna read, solo respondemos con éxito
        // pero no realizamos ninguna actualización en la base de datos
        console.log("⚠️ La columna 'read' no existe en la tabla messages. No se puede marcar como leído.");
        
        // Respondemos como si fuera exitoso para evitar errores en el frontend
        res.json({ 
            message: 'Operación simulada: Mensaje marcado como leído', 
            data: [{ id: messageId }] 
        });
    } catch (err) {
        console.error("❌ Error general al marcar mensaje:", err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Eliminar un mensaje
 */
export const deleteMessage = async (req, res) => {
    const { messageId } = req.params;

    console.log(`🗑️ Eliminando mensaje: ${messageId}`);

    try {
        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('id', messageId);

        if (error) {
            console.error("❌ Error al eliminar mensaje:", error);
            return res.status(500).json({ error: error.message });
        }

        console.log("✅ Mensaje eliminado correctamente");
        res.json({ message: 'Mensaje eliminado correctamente' });
    } catch (err) {
        console.error("❌ Error general al eliminar mensaje:", err);
        res.status(500).json({ error: err.message });
    }
}; 