import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert, ActivityIndicator, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiFetch } from '../../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUserId } from '../../../lib/user';
import { supabase } from '../../../lib/supabase';
import * as Haptics from 'expo-haptics';

// Función para convertir un ID numérico a formato UUID
const convertToUUID = (id: string | number): string => {
  // Si ya es un UUID válido, devolverlo tal cual
  if (typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    return id;
  }
  
  // Si es un número o string numérico, convertirlo a UUID
  if ((typeof id === 'string' && /^\d+$/.test(id)) || typeof id === 'number') {
    const strId = String(id).padStart(12, '0');
    return `00000000-0000-4000-a000-${strId}`;
  }
  
  // Para cualquier otro caso, devolver el ID original
  return String(id);
};

// Función auxiliar para validar si un ID es un UUID o un ID numérico
const isValidId = (id: string): boolean => {
  // Validar si es un UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  // Validar si es un número simple
  const numericRegex = /^[0-9]+$/;
  
  return uuidRegex.test(id) || numericRegex.test(id);
};

// Mantenemos la función isValidUUID para validación específica de UUID cuando se requiera
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

interface Message {
  id: number;
  content?: string;
  contenido?: string; // Soportar ambos nombres para compatibilidad
  sender_id: string;
  receiver_id: string;
  sent_at: string;
  created_at?: string; // Mantener para compatibilidad
  conversation_id?: string;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<{ nombre: string; foto_perfil?: string; id: string } | null>(null);
  const [isConversation, setIsConversation] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const setup = async () => {
      console.log("🔄 Iniciando configuración del chat con ID o username:", id);
      
      // Establecer un timeout para evitar carga infinita
      const timeoutId = setTimeout(() => {
        console.log("⚠️ Timeout alcanzado - saliendo del estado de carga");
        setLoading(false);
      }, 5000);
      
      try {
        const currentUserId = await getCurrentUserId();
        setUserId(currentUserId);
        console.log("👤 Usuario actual:", currentUserId);
        
        if (!currentUserId) {
          console.error("❌ ID de usuario actual no encontrado");
          Alert.alert("Error", "No se pudo identificar tu usuario. Por favor, inicia sesión nuevamente.");
          setLoading(false);
          clearTimeout(timeoutId);
          return;
        }
        
        // Si el id parece ser un id numérico simple de conversación, usarlo directamente
        if (/^\d+$/.test(id)) {
          console.log("🔍 Usando ID numérico de conversación directamente:", id);
          setConversationId(id);
          
          // Buscar detalles de la conversación para obtener información del otro usuario
          try {
            const convRes = await apiFetch(`/conversations/details/${id}`);
            if (convRes.ok) {
              const convData = await convRes.json();
              console.log("✅ Detalles de conversación:", convData);
              
              // Determinar cuál es el otro usuario
              const otherUserId = convData.user_1_id === currentUserId 
                ? convData.user_2_id 
                : convData.user_1_id;
              
              // Buscar información del otro usuario
              const userRes = await apiFetch(`/users/${otherUserId}`);
              if (userRes.ok) {
                const userData = await userRes.json();
                setOtherUser(userData);
              } else {
                // Si no podemos obtener el usuario, usar un valor por defecto
                setOtherUser({ id: otherUserId, nombre: 'Usuario' });
              }
            }
            // Continuar incluso si no se puede obtener detalles de la conversación
            setTimeout(fetchMessages, 500);
          } catch (err) {
            console.error("❌ Error al obtener detalles de conversación:", err);
            // Continuar de todas formas
          }
        } else {
          // Intentar crear una conversación con el usuario especificado
          try {
            console.log("🔍 Buscando usuario para crear conversación:", id);
            const userRes = await apiFetch(`/users/username/${id}`);
            
            if (userRes.ok) {
              const userData = await userRes.json();
              console.log("✅ Usuario encontrado:", userData);
              setOtherUser(userData);
              
              // Crear conversación
              const convRes = await apiFetch('/conversations', {
                method: 'POST',
                body: JSON.stringify({ 
                  user_id1: currentUserId, 
                  user_id2: userData.id 
                }),
              });
              
              if (convRes.ok) {
                const convData = await convRes.json();
                console.log("✅ Conversación creada/encontrada:", convData);
                setConversationId(convData.id);
                setTimeout(fetchMessages, 500);
              } else {
                console.error("❌ Error al crear conversación");
                Alert.alert("Error", "No se pudo iniciar la conversación");
              }
            } else {
              console.error("❌ Usuario no encontrado:", id);
              Alert.alert("Error", "No se encontró el usuario especificado");
            }
          } catch (err) {
            console.error("❌ Error general:", err);
            Alert.alert("Error", "Ocurrió un problema al configurar la conversación");
          }
        }
      } catch (err) {
        console.error("❌ Error en setup:", err);
      } finally {
        // Asegurar que el estado de carga se apague
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };
    
    setup();
    
    // Configurar suscripción a cambios en la tabla messages
    const setupRealtimeSubscription = () => {
      if (!conversationId) return;
      
      console.log("🔄 Configurando suscripción en tiempo real para mensajes...");
      
      try {
        const subscription = supabase
          .channel(`messages-${conversationId}`)
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          }, (payload) => {
            console.log("📥 Nuevo mensaje recibido en tiempo real:", payload);
            fetchMessages();
            
            // Vibrar para notificar al usuario
            try {
              if (Haptics) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
            } catch (e) {
              console.log("No se pudo hacer vibrar el dispositivo");
            }
          })
          .subscribe((status) => {
            console.log("🔌 Estado de suscripción:", status);
          });
        
        return () => {
          console.log("🔄 Limpiando suscripción de tiempo real");
          supabase.removeChannel(subscription);
        };
      } catch (error) {
        console.error("❌ Error al configurar suscripción en tiempo real:", error);
      }
    };
    
    // Configurar intervalo de polling como respaldo
    const interval = setInterval(() => {
      if (conversationId) {
        fetchMessages();
      }
    }, 5000);
    
    // Iniciar suscripción en tiempo real
    const cleanupSubscription = setupRealtimeSubscription();
    
    return () => {
      clearInterval(interval);
      if (cleanupSubscription) cleanupSubscription();
    };
  }, [id, conversationId]); // Añadir conversationId como dependencia para reiniciar suscripción cuando cambie

  const fetchMessages = async () => {
    if (!conversationId) {
      console.log("⏳ Esperando ID de conversación para buscar mensajes");
      // No mantener el estado de carga si no hay ID de conversación
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log("🔍 Buscando mensajes para conversación:", conversationId);
      
      // Intentar primero con la ruta correcta del API
      let res = await apiFetch(`/mensajes/${conversationId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Si falla, intentar con el método alternativo
      if (!res.ok) {
        console.log("⚠️ Primer intento fallido, probando ruta alternativa");
        res = await apiFetch(`/api/mensajes/${conversationId}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      if (res.ok) {
        const data = await res.json();
        console.log(`✅ ${data.length} mensajes encontrados`);
        
        // Transformar los datos si es necesario para garantizar un formato consistente
        const formattedMessages = data.map((msg: any) => ({
          id: msg.id,
          content: msg.content || msg.contenido,
          contenido: msg.content || msg.contenido,
          sender_id: msg.sender_id,
          receiver_id: msg.receiver_id || otherUser?.id, 
          sent_at: msg.sent_at || msg.created_at,
          conversation_id: msg.conversation_id || conversationId
        }));
        
        setMessages(formattedMessages);
      } else {
        console.error("❌ Error al obtener mensajes");
        // En caso de error, establecer mensajes vacíos
        setMessages([]);
      }
    } catch (err) {
      console.error("❌ Error al obtener mensajes:", err);
      setMessages([]);
    } finally {
      // Siempre salir del estado de carga
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    // Si no hay texto, no hacer nada
    if (!input.trim()) {
      return;
    }
    
    try {
      // Verificar que tenemos los datos necesarios
      if (!userId) {
        console.error("❌ Error: No hay ID de usuario");
        Alert.alert("Error", "No se pudo identificar tu usuario");
        return;
      }
      
      if (!otherUser?.id) {
        console.error("❌ Error: No hay ID de destinatario");
        Alert.alert("Error", "No se pudo identificar al destinatario");
        return;
      }
      
      if (!conversationId) {
        console.error("❌ Error: No hay ID de conversación");
        Alert.alert("Error", "No hay una conversación activa");
        return;
      }
      
      console.log("📤 Preparando mensaje con los siguientes datos:", {
        sender_id: userId,
        receiver_id: otherUser.id,
        conversation_id: conversationId,
        contenido: input.length > 20 ? input.substring(0, 20) + '...' : input
      });
      
      // Preparar los datos del mensaje
      const messageData = {
        sender_id: userId,
        receiver_id: otherUser.id,
        contenido: input,
        conversation_id: conversationId
      };
      
      // Mostrar información en consola
      console.log("📤 Enviando mensaje a la API");
      
      // Intentar enviar el mensaje usando la API
      const res = await apiFetch('/mensajes', {
        method: 'POST',
        body: JSON.stringify(messageData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Registrar la respuesta completa para depuración
      console.log("📤 Respuesta del servidor:", {
        status: res.status,
        statusText: res.statusText
      });
      
      if (res.ok) {
        console.log("✅ Mensaje enviado con éxito");
        
        // Limpiar el input y añadir el mensaje localmente para feedback inmediato
        setInput('');
        
        // Añadir mensaje a la lista local
        const newMessage: Message = {
          id: Date.now(),
          content: input,
          contenido: input,
          sender_id: userId,
          receiver_id: otherUser.id,
          sent_at: new Date().toISOString(),
          conversation_id: conversationId
        };
        
        setMessages(prevMessages => [...prevMessages, newMessage]);
        
        // Hacer vibrar el dispositivo como feedback
        try {
          if (Haptics) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } catch (e) {
          console.log("No se pudo hacer vibrar el dispositivo");
        }
        
        // Actualizar mensajes desde el servidor después de un breve retraso
        setTimeout(fetchMessages, 1000);
      } else {
        // Intentar obtener el texto del error
        try {
          const errorText = await res.text();
          console.error("❌ Error al enviar mensaje. Respuesta:", errorText);
          
          try {
            // Si el error es un JSON, parsearlo
            const errorData = JSON.parse(errorText);
            Alert.alert("Error", errorData.error || "No se pudo enviar el mensaje. Intenta nuevamente.");
          } catch (e) {
            // Si no es un JSON, mostrar el texto tal cual
            Alert.alert("Error", "No se pudo enviar el mensaje. Intenta nuevamente.");
          }
        } catch (e) {
          console.error("❌ No se pudo leer la respuesta de error:", e);
          Alert.alert("Error", "No se pudo enviar el mensaje. Intenta nuevamente.");
        }
      }
    } catch (err) {
      console.error("❌ Error general al enviar mensaje:", err);
      Alert.alert("Error", "Ocurrió un problema al enviar el mensaje. Verifica tu conexión.");
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    // Determinar si el mensaje fue enviado por el usuario actual
    const isMine = userId && item.sender_id?.toString() === userId?.toString();
    const messageDate = item.sent_at || item.created_at;
    
    // Depuración para ayudar a entender por qué los mensajes no se clasifican correctamente
    console.log(`🔍 Renderizando mensaje ${item.id}: sender=${item.sender_id}, userId=${userId}, isMine=${isMine}`);
    
    return (
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.messageText, isMine ? styles.textMine : styles.textOther]}>
          {item.content || item.contenido}
        </Text>
        <Text style={styles.time}>
          {messageDate ? new Date(messageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12, 
        borderBottomWidth: 1, 
        borderColor: '#eee',
        marginTop: Platform.OS === 'ios' ? 40 : 10 
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ marginRight: 10 }}
          >
            <Ionicons name="chevron-back" size={28} color="#C76F40" />
          </TouchableOpacity>
          {otherUser?.foto_perfil ? (
            <Image 
              source={{ uri: otherUser.foto_perfil }} 
              style={{ width: 40, height: 40, borderRadius: 20 }} 
            />
          ) : (
            <Ionicons name="person-circle" size={40} color="#C76F40" />
          )}
          <Text style={{ 
            fontSize: 20, 
            fontWeight: 'bold', 
            color: '#C76F40', 
            marginLeft: 12 
          }}>
            {otherUser?.nombre || 'Usuario'}
          </Text>
        </View>
      </View>

      {/* Messages Area - Flex:1 takes all available space */}
      <View style={{ 
        flex: 1, 
        backgroundColor: '#f9f9f9',
        paddingBottom: Platform.OS === 'ios' ? 160 : 140 // Ajustado para compensar la nueva posición de la barra
      }}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#C76F40" />
            <Text style={{ marginTop: 10, color: '#C76F40' }}>Cargando...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: Platform.OS === 'ios' ? 80 : 60 // Ajuste para que el contenido no quede detrás de la barra
          }}>
            <Ionicons name="chatbubble-ellipses-outline" size={60} color="#C76F40" />
            <Text style={{ 
              marginTop: 16, 
              fontSize: 18, 
              fontWeight: 'bold', 
              color: '#C76F40' 
            }}>
              No hay mensajes aún
            </Text>
            <Text style={{ fontSize: 14, color: '#888', marginBottom: 70 }}>
              ¡Envía el primer mensaje!
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id?.toString() || Math.random().toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === 'ios' ? 160 : 140 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}
      </View>

      {/* Fixed Input Bar - Height: 60 ensures visibility */}
      <View style={{ 
        height: 70, 
        borderTopWidth: 2, 
        borderColor: '#C76F40', 
        backgroundColor: '#fff', 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 10,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 80 : 60, // Ajuste para evitar solapamiento con la barra de navegación
        left: 0,
        right: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
        zIndex: 1000
      }}>
        <TextInput
          style={{ 
            flex: 1, 
            height: 45, 
            backgroundColor: '#f5f5f5', 
            borderRadius: 22, 
            paddingHorizontal: 15, 
            marginRight: 10,
            fontSize: 16,
            borderWidth: 1,
            borderColor: '#ddd'
          }}
          value={input}
          onChangeText={setInput}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#999"
          autoFocus={messages.length === 0}
        />
        <TouchableOpacity 
          style={{ 
            backgroundColor: !input.trim() ? '#ccc' : '#C76F40', 
            width: 45, 
            height: 45, 
            borderRadius: 22, 
            justifyContent: 'center', 
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2
          }} 
          onPress={sendMessage}
          disabled={!input.trim()}
        >
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    height: 60,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff3e9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C76F40',
    marginLeft: 12,
  },
  messagesArea: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#C76F40',
    fontSize: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C76F40',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
  },
  inputBarFixed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    padding: 10,
    paddingHorizontal: 15,
    minHeight: 60,
  },
  inputField: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#C76F40',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  bubbleMine: {
    backgroundColor: '#C76F40',
    alignSelf: 'flex-end',
  },
  bubbleOther: {
    backgroundColor: '#f1f1f1',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  textMine: {
    color: '#fff',
  },
  textOther: {
    color: '#222',
  },
  time: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
}); 