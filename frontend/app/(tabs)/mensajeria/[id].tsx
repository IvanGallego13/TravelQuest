import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image, Alert, ActivityIndicator, SafeAreaView, ScrollView, ImageBackground } from 'react-native';
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<{ nombre: string; foto_perfil?: string; id: string } | null>(null);
  const [isConversation, setIsConversation] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationStatus, setConversationStatus] = useState<string>('accepted');
  const [isCreator, setIsCreator] = useState(false);
  const [shouldStop, setShouldStop] = useState(false);
  const router = useRouter();

  // Función para limpiar todos los procesos y redirigir
  const cleanupAndRedirect = () => {
    console.log("🧹 Limpiando todos los procesos y redirigiendo...");
    setShouldStop(true);
    setLoading(false);
    router.push('/(tabs)/mensajeria');
  };

  useEffect(() => {
    const setup = async () => {
      try {
        console.log("🔄 Iniciando configuración del chat con ID o username:", id);
        
        // Establecer un timeout para evitar carga infinita
        const timeoutId = setTimeout(() => {
          console.log("⚠️ Timeout alcanzado - saliendo del estado de carga");
          console.log("📊 Estado actual al timeout:", {
            conversationId,
            otherUser: otherUser?.nombre,
            userId: userId,
            shouldStop,
            initialLoadComplete
          });
          // Solo activar cleanup si realmente no hay datos cargados
          if (!otherUser && !conversationId) {
            cleanupAndRedirect();
          } else {
            console.log("⚠️ Hay datos parciales, no activando cleanup");
            setLoading(false);
          }
        }, 15000); // Aumentar timeout a 15 segundos
        
        try {
          const currentUserId = await getCurrentUserId();
          setUserId(currentUserId);
          console.log("👤 Usuario actual:", currentUserId);
          
          if (!currentUserId) {
            console.error("❌ ID de usuario actual no encontrado");
            clearTimeout(timeoutId);
            cleanupAndRedirect();
            return;
          }
          
          // Validar que el ID proporcionado existe
          if (!id) {
            console.error("❌ ID de conversación no proporcionado");
            clearTimeout(timeoutId);
            cleanupAndRedirect();
            return;
          }
          
          // Si el id parece ser un id numérico simple de conversación, usarlo directamente
          if (/^\d+$/.test(id)) {
            console.log("🔍 Usando ID numérico de conversación directamente:", id);
            const conversationIdStr = id.toString();
            setConversationId(conversationIdStr);
            
            try {
              // Buscar detalles de la conversación para obtener información del otro usuario
              const success = await fetchOtherUserInfo(conversationIdStr, currentUserId);
              
              if (success) {
                // Continuar con la carga de mensajes
                setTimeout(fetchMessages, 500);
              } else {
                console.error("❌ No se pudo obtener información de la conversación:", conversationIdStr);
                // Dar más tiempo antes de activar shouldStop
                console.log("⚠️ Reintentando obtener información en 2 segundos...");
                setTimeout(async () => {
                  const retrySuccess = await fetchOtherUserInfo(conversationIdStr, currentUserId);
                  if (retrySuccess) {
                    fetchMessages();
                  } else {
                    console.log("❌ Segundo intento fallido, activando cleanup");
                    clearTimeout(timeoutId);
                    cleanupAndRedirect();
                  }
                }, 2000);
              }
            } catch (convError) {
              console.error("❌ Error al obtener información de la conversación:", convError);
              // Dar una oportunidad más antes de cleanup
              setTimeout(() => {
                clearTimeout(timeoutId);
                cleanupAndRedirect();
              }, 1000);
            }
          } else {
            // Intentar crear una conversación con el usuario especificado
            try {
              console.log("🔍 Buscando usuario para crear conversación:", id);
              const userRes = await apiFetch(`/users/username/${id}`) as Response;
              
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
                }) as Response;
                
                if (convRes.ok) {
                  const convData = await convRes.json();
                  console.log("✅ Conversación creada/encontrada:", convData);
                  setConversationId(convData.id);
                  setConversationStatus(convData.status || 'accepted');
                  setIsCreator(convData.created_by === currentUserId);
                  setTimeout(fetchMessages, 500);
                } else {
                  console.error("❌ Error al crear conversación");
                  clearTimeout(timeoutId);
                  cleanupAndRedirect();
                  return;
                }
              } else {
                console.error("❌ Usuario no encontrado:", id);
                clearTimeout(timeoutId);
                cleanupAndRedirect();
                return;
              }
            } catch (err) {
              console.error("❌ Error general al buscar usuario:", err);
              clearTimeout(timeoutId);
              cleanupAndRedirect();
              return;
            }
          }
        } catch (err) {
          console.error("❌ Error en setup:", err);
          clearTimeout(timeoutId);
          cleanupAndRedirect();
          return;
        } finally {
          // Asegurar que el estado de carga se apague
          setLoading(false);
          clearTimeout(timeoutId);
        }
      } catch (outerError) {
        console.error("❌ Error crítico en setup:", outerError);
        cleanupAndRedirect();
      }
    };
    
    // Solo ejecutar setup si shouldStop no está activado
    if (!shouldStop) {
      setup();
    }
    
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
            
            // En lugar de llamar a fetchMessages (que podría mostrar carga),
            // integramos directamente el nuevo mensaje en el estado
            if (payload.new) {
              const newMessage = payload.new;
              
              // Transformar los datos si es necesario para garantizar un formato consistente
              const formattedMessage = {
                id: newMessage.id,
                content: newMessage.content || newMessage.contenido,
                contenido: newMessage.content || newMessage.contenido,
                sender_id: newMessage.sender_id,
                receiver_id: newMessage.receiver_id || otherUser?.id,
                sent_at: newMessage.sent_at || newMessage.created_at,
                conversation_id: newMessage.conversation_id || conversationId
              };
              
              // Actualizar el estado sin mostrar indicador de carga
              setMessages(prevMessages => [...prevMessages, formattedMessage]);
              
              // Desplazarse al último mensaje
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            } else {
              // Si por alguna razón no tenemos los datos del nuevo mensaje, 
              // hacemos una actualización completa en segundo plano
              fetchMessages();
            }
            
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
      // No ejecutar si shouldStop está activado
      if (shouldStop) {
        console.log("🛑 Deteniendo intervalo de mensajes por shouldStop");
        clearInterval(interval);
        return;
      }

      // No ejecutar si no hay conversationId válido
      if (!conversationId || !isValidId(conversationId)) {
        console.log("🛑 Deteniendo intervalo de mensajes por conversationId inválido");
        setShouldStop(true);
        clearInterval(interval);
        return;
      }

      // No ejecutar si no hay userId
      if (!userId) {
        console.log("🛑 Deteniendo intervalo de mensajes por userId inexistente");
        setShouldStop(true);
        clearInterval(interval);
        return;
      }

      // Ejecutar una versión silenciosa de fetchMessages
      silentFetchMessages().catch((error) => {
        console.error("❌ Error en silentFetchMessages desde intervalo:", error);
        setShouldStop(true);
        clearInterval(interval);
      });
    }, 2000); // Reducir frecuencia a 2 segundos
    
    // Iniciar suscripción en tiempo real
    const cleanupSubscription = setupRealtimeSubscription();
    
    return () => {
      clearInterval(interval);
      if (cleanupSubscription) cleanupSubscription();
    };
  }, [id, conversationId]); // Añadir conversationId como dependencia para reiniciar suscripción cuando cambie

  const fetchMessages = async () => {
    // Si ya se completó la carga inicial, no mostrar el indicador de carga para actualizaciones
    const isInitialLoad = !initialLoadComplete;
    
    if (!conversationId) {
      console.log("⏳ Esperando ID de conversación para buscar mensajes");
      // No mantener el estado de carga si no hay ID de conversación
      if (isInitialLoad) {
        setLoading(false);
        setInitialLoadComplete(true);
      }
      return;
    }
    
    // Solo mostrar loading en la carga inicial
    if (isInitialLoad) {
      setLoading(true);
    }
    
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
      // Marcar que la carga inicial está completa
      if (isInitialLoad) {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    }
  };

  // Versión silenciosa de fetchMessages que no actualiza el estado de carga
  const silentFetchMessages = async () => {
    if (!conversationId || shouldStop) return;
    
    try {
      console.log("🔄 Actualizando mensajes silenciosamente...");
      
      const res = await apiFetch(`/mensajes/${conversationId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      }) as Response;
      
      if (res.ok) {
        const data = await res.json();
        
        // Solo actualizar si hay diferencia en la cantidad de mensajes
        if (data.length !== messages.length) {
          console.log(`✅ Se encontraron ${data.length} mensajes (antes: ${messages.length})`);
          
          // Transformar los datos para garantizar consistencia
          const formattedMessages = data.map((msg: any) => ({
            id: msg.id,
            content: msg.content || msg.contenido,
            contenido: msg.content || msg.contenido,
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id || otherUser?.id, 
            sent_at: msg.sent_at || msg.created_at,
            conversation_id: msg.conversation_id || conversationId
          }));
          
          // Actualizar el estado sin mostrar carga
          setMessages(formattedMessages);
          
          // Desplazarse al último mensaje
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      } else if (res.status === 404 || res.status === 500) {
        // Si la conversación no existe, activar shouldStop
        console.log("🛑 Conversación no encontrada en silentFetchMessages, activando shouldStop");
        setShouldStop(true);
      }
    } catch (err) {
      console.error("❌ Error en actualización silenciosa:", err);
      // Activar shouldStop en caso de errores persistentes
      setShouldStop(true);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || !userId) return;
    
    // No permitir enviar mensajes si la conversación está pendiente
    if (conversationStatus === 'pending') {
      if (isCreator) {
        Alert.alert("Chat pendiente", "El destinatario aún no ha aceptado tu solicitud de chat.");
      } else {
        Alert.alert("Chat pendiente", "Primero debes aceptar esta solicitud de chat para poder conversar.");
      }
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
        // pero usando la versión silenciosa para no mostrar la rueda de carga
        setTimeout(silentFetchMessages, 1000);
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

  // Función para obtener información actualizada del otro usuario
  const fetchOtherUserInfo = async (conversationId: string, currentUserId: string) => {
    // Si ya se determinó que debemos parar, no hacer más peticiones
    if (shouldStop) {
      console.log("🛑 Deteniendo fetchOtherUserInfo debido a shouldStop");
      return false;
    }

    try {
      if (!conversationId || !isValidId(conversationId)) {
        console.error("❌ ID de conversación inválido:", conversationId);
        // No activar shouldStop inmediatamente, dar una oportunidad más
        return false;
      }

      console.log("🔍 Buscando información de conversación:", conversationId);
      
      try {
        const res = await apiFetch(`/conversations/details/${conversationId}`) as Response;
        
        if (!res.ok) {
          console.error("❌ Error al obtener detalles de conversación:", res.status, res.statusText);
          
          // Solo activar shouldStop en casos definitivos (404 y 500)
          if (res.status === 404) {
            console.log("📝 Conversación no encontrada (404), activando shouldStop");
            setShouldStop(true);
            cleanupAndRedirect();
            return false;
          }
          
          // Para otros errores, no activar shouldStop inmediatamente
          if (res.status === 500) {
            console.log("⚠️ Error de servidor (500), reintentando más tarde...");
          }
          
          return false;
        }
        
        const conversation = await res.json();
        console.log("✅ Detalles de conversación:", conversation);
        
        // Verificar que los datos son válidos pero con más tolerancia
        if (!conversation) {
          console.error("❌ Respuesta de conversación vacía");
          return false;
        }
        
        if (!conversation.user_1_id || !conversation.user_2_id) {
          console.error("❌ Datos de conversación incompletos:", conversation);
          return false;
        }
        
        // Determinar cuál es el otro usuario en la conversación
        const otherUserId = conversation.user_1_id === currentUserId 
          ? conversation.user_2_id 
          : conversation.user_1_id;
        
        // Guardar el estado de la conversación
        setConversationStatus(conversation.status || 'accepted');
        setIsCreator(conversation.created_by === currentUserId);
        
        console.log("🔍 Buscando información del otro usuario:", otherUserId);
        const userRes = await apiFetch(`/users/${otherUserId}`) as Response;
        
        if (!userRes.ok) {
          console.error("❌ Error al obtener información del usuario:", userRes.status);
          
          // Solo activar shouldStop para 404 definitivos
          if (userRes.status === 404) {
            console.log("📝 Usuario no encontrado (404), posible inconsistencia de datos");
            setShouldStop(true);
            cleanupAndRedirect();
            return false;
          }
          
          return false;
        }
        
        const userData = await userRes.json();
        console.log("✅ Datos del otro usuario obtenidos:", userData);
        
        // Verificar que los datos del usuario son válidos
        if (!userData || !userData.id) {
          console.error("❌ Datos de usuario inválidos:", userData);
          return false;
        }
        
        // Mapear los datos correctamente al formato esperado
        const formattedUser = {
          id: userData.id,
          nombre: userData.username || userData.nombre || 'Usuario',
          foto_perfil: userData.avatar_url || userData.foto_perfil,
          username: userData.username
        };
        
        console.log("✅ Usuario formateado:", formattedUser);
        setOtherUser(formattedUser);
        
        return true;
      } catch (apiError) {
        console.error("❌ Error en la petición API:", apiError);
        // No activar shouldStop por errores de red, dar más oportunidades
        return false;
      }
    } catch (err) {
      console.error("❌ Error general al obtener información de usuario:", err);
      // No activar shouldStop por errores generales
      return false;
    }
  };

  useEffect(() => {
    // Si tenemos ID de conversación y de usuario, configurar intervalo para actualizar info de usuario
    if (conversationId && userId && !shouldStop && initialLoadComplete) {
      // Esperar un poco antes de iniciar el intervalo para dar tiempo a la carga inicial
      const delayTimeout = setTimeout(() => {
        const userInfoInterval = setInterval(async () => {
          // No ejecutar si shouldStop está activado
          if (shouldStop) {
            console.log("🛑 Deteniendo intervalo de actualización de usuario por shouldStop");
            clearInterval(userInfoInterval);
            return;
          }

          // Verificar que aún tenemos datos válidos
          if (!conversationId || !isValidId(conversationId)) {
            console.log("🛑 Deteniendo intervalo de actualización por conversationId inválido");
            clearInterval(userInfoInterval);
            return;
          }

          if (!userId) {
            console.log("🛑 Deteniendo intervalo de actualización por userId inexistente");
            clearInterval(userInfoInterval);
            return;
          }

          // Actualizar información del usuario periódicamente pero con manejo de errores silencioso
          try {
            const success = await fetchOtherUserInfo(conversationId, userId);
            // Si no se pudo obtener la información y ya han pasado múltiples intentos, detener
            if (!success && otherUser === null) {
              console.log("🔄 No se pudo obtener información del usuario después de múltiples intentos");
              clearInterval(userInfoInterval);
            }
          } catch (error) {
            console.error("❌ Error en intervalo de actualización:", error);
            // Solo limpiar intervalo, no activar shouldStop
            clearInterval(userInfoInterval);
          }
        }, 10000); // Aumentar intervalo a 10 segundos
        
        // Limpiar intervalos cuando el componente se desmonte
        return () => {
          console.log("🧹 Limpiando intervalo de actualización de usuario");
          clearInterval(userInfoInterval);
        };
      }, 5000); // Esperar 5 segundos antes de iniciar el intervalo
      
      return () => {
        clearTimeout(delayTimeout);
      };
    }
  }, [conversationId, userId, shouldStop, initialLoadComplete]);

  return (
    <ImageBackground  source={require("../../../assets/images/fondo.png")}
    style={{ flex: 1 }}
    resizeMode="cover"
    >
        <View style={{ flex: 1}}>
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
                onPress={() => router.push('/(tabs)/mensajeria')}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="chevron-back" size={28} color="#FEF7FF" />
              </TouchableOpacity>
              {otherUser?.foto_perfil ? (
                <Image 
                  source={{ uri: otherUser.foto_perfil }} 
                  style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff3e9' }} 
                  defaultSource={require('../../../assets/images/avatar.png')}
                />
              ) : (
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff3e9', justifyContent: 'center', alignItems: 'center' }}>
                  <Image
                    source={require('../../../assets/images/avatar.png')}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                </View>
              )}
              <Text style={{ 
                fontSize: 20, 
                fontWeight: 'bold', 
                color: '#FEF7FF', 
                marginLeft: 12 
              }}>
                {otherUser?.nombre || 'Usuario'}
              </Text>
            </View>
          </View>

          {/* Mensaje de chat pendiente */}
          {conversationStatus === 'pending' && (
            <View style={{
              backgroundColor: '#FFF8E1',
              padding: 16,
              marginHorizontal: 16,
              marginTop: 16,
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor: '#FFAB40',
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Ionicons name="alert-circle" size={24} color="#FFAB40" style={{ marginRight: 8 }} />
              <Text style={{ flex: 1, color: '#333' }}>
                {isCreator 
                  ? 'Has enviado una solicitud de chat. Espera a que el destinatario la acepte.' 
                  : 'Has recibido una solicitud de chat. Ve a "Chats creados" para aceptarla o rechazarla.'}
              </Text>
            </View>
          )}

          {/* Messages Area - Flex:1 takes all available space */}
          <View style={{ 
            flex: 1, 
            backgroundColor: '#f9f9f9',
            paddingBottom: Platform.OS === 'ios' ? 160 : 140
          }}>
            {loading && !initialLoadComplete ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#403796" />
                <Text style={{ marginTop: 10, color: '#403796' }}>Cargando...</Text>
              </View>
            ) : messages.length === 0 ? (
              <View style={{ 
                flex: 1, 
                justifyContent: 'center', 
                alignItems: 'center',
                marginBottom: Platform.OS === 'ios' ? 80 : 60
              }}>
                <Ionicons name="chatbubble-ellipses-outline" size={60} color="#C76F40" />
                <Text style={{ 
                  marginTop: 16, 
                  fontSize: 18, 
                  fontWeight: 'bold', 
                  color: '#403796' 
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
            borderColor: '#403796', 
            backgroundColor: '#fff', 
            flexDirection: 'row', 
            alignItems: 'center', 
            padding: 10,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 80 : 60,
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
      </ImageBackground>
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