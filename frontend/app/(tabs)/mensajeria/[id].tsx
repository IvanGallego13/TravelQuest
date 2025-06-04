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
  const router = useRouter();
  
  // Verificación mínima - solo verificar si hay ID
  useEffect(() => {
    if (!id) {
      console.log("❌ No hay ID proporcionado, redirigiendo");
      router.replace('/(tabs)/mensajeria');
      return;
    }
  }, [id]);
  
  // Si no hay ID, no renderizar nada
  if (!id) {
    return null;
  }
  
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
  const [lastMessageSentAt, setLastMessageSentAt] = useState<number | null>(null);

  // Lista negra de IDs de conversaciones que no existen para evitar bucles infinitos
  const [blacklistedIds, setBlacklistedIds] = useState<Set<string>>(new Set());

  // Referencias para los intervalos para poder limpiarlos correctamente
  const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userInfoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const userInfoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Función para verificar si un ID está en la lista negra
  const isBlacklisted = (conversationId: string) => {
    return blacklistedIds.has(conversationId);
  };

  // Función para agregar un ID a la lista negra
  const addToBlacklist = (conversationId: string) => {
    console.log("🚫 Agregando ID a lista negra:", conversationId);
    setBlacklistedIds(prev => new Set([...prev, conversationId]));
    // NO activar shouldStop inmediatamente aquí - dejar que el flujo normal lo maneje
  };

  // Función para limpiar todos los intervalos
  const clearAllIntervals = () => {
    console.log("🧹 Limpiando TODOS los intervalos y procesos");
    
    try {
      if (messageIntervalRef.current) {
        clearInterval(messageIntervalRef.current);
        messageIntervalRef.current = null;
        console.log("✅ Intervalo de mensajes limpiado");
      }
      
      if (userInfoIntervalRef.current) {
        clearInterval(userInfoIntervalRef.current);
        userInfoIntervalRef.current = null;
        console.log("✅ Intervalo de usuario limpiado");
      }
      
      if (userInfoTimeoutRef.current) {
        clearTimeout(userInfoTimeoutRef.current);
        userInfoTimeoutRef.current = null;
        console.log("✅ Timeout de usuario limpiado");
      }
      
      // Limpiar cualquier otro timeout/interval que pueda estar ejecutándose
      for (let i = 1; i < 10000; i++) {
        clearTimeout(i);
        clearInterval(i);
      }
      
      console.log("✅ Todos los procesos limpiados completamente");
    } catch (error) {
      console.error("❌ Error al limpiar intervalos:", error);
    }
  };

  const cleanupAndRedirect = () => {
    console.log("🔄 Iniciando limpieza y redirección");
    setShouldStop(true);
    clearAllIntervals();
    setTimeout(() => {
      router.replace('/(tabs)/mensajeria');
    }, 100);
  };

  // Efecto para limpiar inmediatamente cuando shouldStop se activa
  useEffect(() => {
    if (shouldStop) {
      console.log("🛑 shouldStop activado - limpiando y redirigiendo");
      clearAllIntervals();
      setLoading(false);
      
      // Solo redirigir si realmente no hay datos válidos O si la conversación está en lista negra
      const hasValidData = otherUser && conversationId;
      const isCurrentConversationBlacklisted = conversationId && isBlacklisted(conversationId);
      
      if (!hasValidData || isCurrentConversationBlacklisted) {
        console.log("🔄 Redirigiendo porque no hay datos válidos o la conversación está en lista negra");
        setTimeout(() => {
          router.replace('/(tabs)/mensajeria');
        }, 500);
      } else {
        console.log("✅ Hay datos válidos, no redirigiendo. Simplemente deteniendo intervalos.");
        // Si hay datos válidos, no redirigir, solo detener los intervalos problemáticos
      }
    }
  }, [shouldStop, otherUser, conversationId]);

  // Efecto para manejar IDs que se agregan a la lista negra
  useEffect(() => {
    if (conversationId && isBlacklisted(conversationId)) {
      console.log("🚫 Conversación actual está en lista negra, activando shouldStop");
      setShouldStop(true);
    }
  }, [blacklistedIds, conversationId]);

  useEffect(() => {
    const setup = async () => {
      try {
        console.log("🔄 Iniciando configuración del chat con ID o username:", id);
        console.log("📊 Estado inicial:", {
          shouldStop,
          blacklistedCount: blacklistedIds.size,
          isCurrentIdBlacklisted: id ? isBlacklisted(id.toString()) : false
        });
        
        // Si el ID ya está en lista negra, redirigir inmediatamente
        if (id && isBlacklisted(id.toString())) {
          console.log("🚫 ID ya está en lista negra, redirigiendo sin hacer peticiones");
          router.replace('/(tabs)/mensajeria');
          return;
        }
        
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
        }, 25000); // Aumentar timeout a 25 segundos para dar más tiempo
        
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
            
            // Verificar si el ID está en la lista negra
            if (isBlacklisted(conversationIdStr)) {
              console.log("🚫 ID está en lista negra, redirigiendo inmediatamente:", conversationIdStr);
              clearTimeout(timeoutId);
              router.replace('/(tabs)/mensajeria');
              return;
            }
            
            setConversationId(conversationIdStr);
            
            try {
              // Primero verificar si la conversación existe
              console.log("🔍 Verificando existencia de conversación:", conversationIdStr);
              const testRes = await apiFetch(`/conversations/details/${conversationIdStr}`) as Response;
              
              if (!testRes.ok) {
                console.log("❌ Conversación no existe, agregando a lista negra y redirigiendo");
                addToBlacklist(conversationIdStr);
                clearTimeout(timeoutId);
                router.replace('/(tabs)/mensajeria');
                return;
              }
              
              // Si la conversación existe, proceder con la carga
              const success = await fetchOtherUserInfo(conversationIdStr, currentUserId);
              
              if (success) {
                // Continuar con la carga de mensajes inmediatamente
                console.log("✅ Información de usuario obtenida, cargando mensajes...");
                await fetchMessages();
                
                // Llamadas adicionales para asegurar carga
                setTimeout(() => {
                  fetchMessages();
                }, 1000);
                
                setTimeout(() => {
                  fetchMessages();
                }, 2500);
              } else {
                console.error("❌ No se pudo obtener información de la conversación:", conversationIdStr);
                // Dar múltiples intentos antes de rendirse
                console.log("⚠️ Primer intento fallido, reintentando en 3 segundos...");
                setTimeout(async () => {
                  const retrySuccess = await fetchOtherUserInfo(conversationIdStr, currentUserId);
                  if (retrySuccess) {
                    console.log("✅ Segundo intento exitoso, cargando mensajes...");
                    await fetchMessages();
                  } else {
                    console.log("⚠️ Segundo intento fallido, reintentando una vez más en 5 segundos...");
                    setTimeout(async () => {
                      const finalRetrySuccess = await fetchOtherUserInfo(conversationIdStr, currentUserId);
                      if (finalRetrySuccess) {
                        console.log("✅ Tercer intento exitoso, cargando mensajes...");
                        await fetchMessages();
                      } else {
                        console.log("❌ Todos los intentos fallaron, redirigiendo");
                        clearTimeout(timeoutId);
                        router.replace('/(tabs)/mensajeria');
                      }
                    }, 5000);
                  }
                }, 3000);
              }
            } catch (convError) {
              console.error("❌ Error al verificar conversación:", convError);
              // Redirigir silenciosamente
              clearTimeout(timeoutId);
              router.push('/(tabs)/mensajeria');
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
                  console.log("🔄 Actualizando conversationId de", conversationId, "a", convData.id);
                  setConversationId(convData.id.toString()); // Asegurar que sea string
                  setConversationStatus(convData.status || 'accepted');
                  setIsCreator(convData.created_by === currentUserId);
                  
                  // Limpiar lista negra para el nuevo ID
                  if (convData.id) {
                    setBlacklistedIds(prev => {
                      const newSet = new Set(prev);
                      newSet.delete(convData.id.toString());
                      return newSet;
                    });
                  }
                  
                  // Verificar estado de conversación inmediatamente después de configurar usuario
                  console.log("🔄 Verificando estado de conversación inmediatamente después de configurar usuario");
                  setTimeout(async () => {
                    await checkAndUpdateConversationId();
                  }, 200);
                  
                  // Forzar carga de mensajes después de crear/encontrar conversación
                  console.log("✅ Conversación configurada, forzando carga de mensajes para ID:", convData.id);
                  setTimeout(async () => {
                    await fetchMessages();
                  }, 1000);
                  
                  // Llamadas adicionales para casos de conversaciones nuevas
                  setTimeout(() => {
                    fetchMessages();
                  }, 2000);
                  
                  setTimeout(() => {
                    fetchMessages();
                  }, 4000);
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
            
            // Forzar actualización inmediata desde el servidor para asegurar consistencia
            setTimeout(() => {
              silentFetchMessages();
            }, 500);
            
            // Vibrar para notificar al usuario si el mensaje no es propio
            if (payload.new && payload.new.sender_id !== userId) {
              try {
                if (Haptics) {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
              } catch (e) {
                console.log("No se pudo hacer vibrar el dispositivo");
              }
            }
          })
          .subscribe((status) => {
            console.log("🔌 Estado de suscripción en tiempo real:", status);
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
      // Solo verificar condiciones básicas necesarias
      if (!conversationId || !userId) {
        return; // No detener el intervalo, solo saltar esta ejecución
      }

      // Ejecutar actualización de mensajes de forma más simple
      silentFetchMessages().catch((error) => {
        console.error("❌ Error en intervalo de mensajes:", error);
        // No detener el intervalo por errores ocasionales, solo logear
      });
    }, 1000); // Cambiar a 1 segundo para balance entre velocidad y performance
    
    // Guardar la referencia del intervalo
    messageIntervalRef.current = interval;
    
    // Iniciar suscripción en tiempo real
    const cleanupSubscription = setupRealtimeSubscription();
    
    return () => {
      clearInterval(interval);
      messageIntervalRef.current = null;
      if (cleanupSubscription) cleanupSubscription();
    };
  }, [id, conversationId, userId]); // Agregar userId como dependencia también

  const fetchMessages = async () => {
    // Si ya se completó la carga inicial, no mostrar el indicador de carga para actualizaciones
    const isInitialLoad = !initialLoadComplete;
    
    console.log("🔍 === INICIO FETCH MESSAGES ===");
    console.log("📊 Estado actual de fetchMessages:", {
      conversationId,
      isInitialLoad,
      shouldStop,
      userId,
      otherUser: otherUser?.nombre
    });
    
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
      console.log("🔍 === DEBUGGING DETALLADO ===");
      console.log("🆔 conversationId usado:", conversationId);
      console.log("🆔 tipo de conversationId:", typeof conversationId);
      console.log("👤 userId:", userId);
      console.log("👥 otherUser:", otherUser);
      
      // Usar apiFetch con la configuración correcta
      console.log("🌐 Usando apiFetch para:", `/mensajes/${conversationId}`);
      
      const res = await apiFetch(`/mensajes/${conversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }) as Response;
      
      console.log("📡 Respuesta de la API:", {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        url: res.url
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("✅ Datos RAW de la API:", data);
        console.log("📊 Cantidad total:", data.length);
        
        if (data.length > 0) {
          console.log("📝 Primer mensaje completo:", data[0]);
          console.log("📝 Último mensaje completo:", data[data.length - 1]);
        } else {
          console.log("⚠️ LA API DEVOLVIÓ ARRAY VACÍO");
          console.log("🔍 Verificando en base de datos si hay mensajes con conversation_id:", conversationId);
        }
        
        // Verificar si hay cambios reales comparando el último mensaje
        const hasNewMessages = data.length !== messages.length || 
          (data.length > 0 && messages.length > 0 && 
           data[data.length - 1].id !== messages[messages.length - 1]?.id);
        
        // Solo logear cuando hay cambios para evitar spam
        if (hasNewMessages) {
          console.log("🔄 Nuevos mensajes detectados:", {
            antes: messages.length,
            ahora: data.length
          });
        }
        
        // Actualizar siempre para mantenerse sincronizado
        setMessages(data);
        console.log("✅ Estado actualizado con", data.length, "mensajes");
        
        // Desplazarse al último mensaje solo si hay mensajes nuevos
        if (hasNewMessages) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 50);
        }
      } else {
        // CUALQUIER error HTTP detiene todo
        console.log(`🚫 Error HTTP ${res.status} en fetchMessages - deteniendo procesos`);
        addToBlacklist(conversationId);
        setShouldStop(true);
        clearAllIntervals();
        
        // Si es error de autenticación, redirigir a login
        if (res.status === 401) {
          setTimeout(() => {
            router.replace('/login');
          }, 1000);
        } else {
          // Para otros errores, redirigir a mensajería
          setTimeout(() => {
            router.replace('/(tabs)/mensajeria');
          }, 1000);
        }
        
        // En caso de error, establecer mensajes vacíos
        setMessages([]);
      }
    } catch (err) {
      console.error("❌ Error al obtener mensajes:", err);
      
      // CUALQUIER error de fetch detiene todo
      console.log("🚫 Error de fetch en fetchMessages - deteniendo procesos");
      addToBlacklist(conversationId);
      setShouldStop(true);
      clearAllIntervals();
      
      setTimeout(() => {
        router.replace('/(tabs)/mensajeria');
      }, 1000);
      
      setMessages([]);
    } finally {
      // Marcar que la carga inicial está completa
      if (isInitialLoad) {
        setLoading(false);
        setInitialLoadComplete(true);
      }
      console.log("🔍 === FIN FETCH MESSAGES ===");
    }
  };

  // Versión silenciosa de fetchMessages que no actualiza el estado de carga
  const silentFetchMessages = async () => {
    if (!conversationId || !userId) return;
    
    try {
      console.log("🔄 Actualizando mensajes silenciosamente para:", conversationId);
      
      const res = await apiFetch(`/mensajes/${conversationId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }) as Response;
      
      if (res.ok) {
        const data = await res.json();
        
        // Verificar si hay cambios reales comparando el último mensaje
        const hasNewMessages = data.length !== messages.length || 
          (data.length > 0 && messages.length > 0 && 
           data[data.length - 1].id !== messages[messages.length - 1]?.id);
        
        // Actualizar siempre para mantenerse sincronizado
        setMessages(data);
        
        // Desplazarse al último mensaje solo si hay mensajes nuevos
        if (hasNewMessages) {
          console.log("✅ Nuevos mensajes actualizados:", data.length);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 50);
        }
      } else {
        console.log(`⚠️ Error HTTP ${res.status} en silentFetchMessages - continuando sin detener`);
        // No detener por errores HTTP, solo logear y continuar
      }
    } catch (err) {
      console.error("⚠️ Error en silentFetchMessages - continuando:", err);
      // No detener por errores de red, solo logear y continuar
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || !userId) return;
    
    console.log("📤 Iniciando envío de mensaje...");
    console.log("📊 Estado actual:", {
      conversationId,
      userId,
      otherUserId: otherUser?.id,
      input: input.substring(0, 20) + (input.length > 20 ? '...' : '')
    });
    
    // VERIFICACIÓN CRÍTICA: Actualizar conversationId antes de enviar
    console.log("🔍 Verificando conversationId antes de enviar mensaje...");
    await checkAndUpdateConversationId();
    
    // Esperar un momento para que se procese la actualización
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Verificar de nuevo el conversationId después de la actualización
    if (!conversationId) {
      console.error("❌ No hay conversationId después de verificación");
      Alert.alert("Error", "No hay una conversación activa");
      return;
    }
    
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
      
      // DEBUGGING: Verificar el conversation_id antes de enviar
      console.log("📤 === ENVIANDO MENSAJE ===");
      console.log("🆔 conversationId FINAL a usar:", conversationId);
      console.log("🆔 tipo de conversationId:", typeof conversationId);
      console.log("👤 sender_id:", userId);
      console.log("👥 receiver_id:", otherUser.id);
      
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
        
        // Limpiar el input
        setInput('');
        
        // Actualizar mensajes inmediatamente con múltiples estrategias
        silentFetchMessages();
        
        // Actualizaciones escalonadas para asegurar que aparezca
        setTimeout(() => {
          silentFetchMessages();
        }, 50);
        
        setTimeout(() => {
          silentFetchMessages();
        }, 150);
        
        setTimeout(() => {
          silentFetchMessages();
        }, 300);
        
        setTimeout(() => {
          silentFetchMessages();
        }, 600);
        
        setTimeout(() => {
          silentFetchMessages();
        }, 1000);
        
        setTimeout(() => {
          silentFetchMessages();
        }, 2000);
        
        // Hacer vibrar el dispositivo como feedback
        try {
          if (Haptics) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } catch (e) {
          console.log("No se pudo hacer vibrar el dispositivo");
        }

        // Actualizar el tiempo del último mensaje enviado
        setLastMessageSentAt(Date.now());
      } else {
        // Intentar obtener el texto del error
        try {
          const errorText = await res.text();
          console.error("❌ Error al enviar mensaje. Respuesta:", errorText);
          
          // Si el error es que la conversación no se encontró, intentar actualizar
          if (errorText.includes("no encontrada") || res.status === 404) {
            console.log("🔄 Conversación no encontrada, intentando actualizar...");
            await checkAndUpdateConversationId();
            
            Alert.alert(
              "Conversación actualizada", 
              "Se ha detectado una nueva conversación. Intenta enviar el mensaje nuevamente.",
              [{ text: "OK" }]
            );
            return;
          }
          
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
    console.log(`🔍 === RENDERIZANDO MENSAJE ${item.id} ===`);
    console.log(`📝 Contenido: "${item.content || item.contenido}"`);
    console.log(`👤 Sender: ${item.sender_id}, Usuario actual: ${userId}`);
    console.log(`💬 Es mío: ${isMine}`);
    console.log(`📅 Fecha: ${messageDate}`);
    console.log(`🆔 Conversation ID: ${item.conversation_id}`);
    
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
    // Verificar inmediatamente si el ID está en la lista negra
    if (isBlacklisted(conversationId)) {
      console.log("🚫 ID está en lista negra, no buscando información de usuario:", conversationId);
      return false;
    }

    // Si shouldStop está activado, no continuar
    if (shouldStop) {
      console.log("🛑 shouldStop está activado, no buscando información de usuario");
      return false;
    }

    try {
      // Validar que el ID de conversación parece válido
      if (!conversationId || conversationId === 'null' || conversationId === 'undefined') {
        console.error("❌ ID de conversación inválido:", conversationId);
        return false;
      }

      console.log("🔍 Buscando información de conversación:", conversationId);
      
      try {
        const res = await apiFetch(`/conversations/details/${conversationId}`) as Response;
        
        if (!res.ok) {
          // Manejo silencioso de errores 404 (conversación eliminada)
          if (res.status === 404) {
            console.log("📝 Conversación no encontrada (404) - posiblemente eliminada:", conversationId);
            // Agregar silenciosamente a lista negra para evitar futuras peticiones
            addToBlacklist(conversationId);
            // Detener procesos para esta conversación específica
            setShouldStop(true);
            return false;
          }
          
          console.error("❌ Error al obtener detalles de conversación:", res.status, res.statusText);
          console.log("🔍 ID de conversación que falló:", conversationId);
          
          // Manejo específico de errores
          if (res.status === 401) {
            console.log("🚫 Token expirado - redirigiendo a login");
            setShouldStop(true);
            clearAllIntervals();
            setTimeout(() => {
              router.replace('/login');
            }, 1000);
            return false;
          }
          
          // Para otros errores, solo agregar a lista negra después de múltiples fallos
          if (!otherUser) {
            console.log("📝 No hay datos de usuario cargados, agregando a lista negra");
            addToBlacklist(conversationId);
            setShouldStop(true);
            clearAllIntervals();
          } else {
            console.log("📝 Ya tenemos datos de usuario, no agregando a lista negra");
          }
          return false;
        }
        
        const conversation = await res.json();
        console.log("✅ Detalles de conversación:", conversation);
        
        // Verificar que los datos son válidos
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
        
        console.log("📊 Estado de conversación configurado:", {
          status: conversation.status || 'accepted',
          isCreator: conversation.created_by === currentUserId,
          conversationId: conversationId
        });
        
        console.log("🔍 Buscando información del otro usuario:", otherUserId);
        const userRes = await apiFetch(`/users/${otherUserId}`) as Response;
        
        if (!userRes.ok) {
          console.error("❌ Error al obtener información del usuario:", userRes.status);
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
        
        // Verificar estado de conversación inmediatamente después de configurar usuario
        console.log("🔄 Verificando estado de conversación inmediatamente después de configurar usuario");
        setTimeout(async () => {
          await checkAndUpdateConversationId();
        }, 200);
        
        // Cargar mensajes inmediatamente después de obtener info del usuario
        console.log("🔄 Cargando mensajes inmediatamente después de obtener usuario");
        setTimeout(() => {
          silentFetchMessages();
        }, 500);
        
        // Segundo intento para asegurar carga
        setTimeout(() => {
          fetchMessages();
        }, 1500);
        
        // Tercer intento para casos donde la primera carga no funciona
        setTimeout(() => {
          fetchMessages();
        }, 3000);
        
        return true;
      } catch (apiError) {
        // Manejo silencioso de errores de parsing JSON (puede ser 404 con respuesta vacía)
        if (apiError instanceof Error && (apiError.message?.includes('JSON') || apiError.message?.includes('Unexpected end of input'))) {
          console.log("📝 Error de parsing JSON - posiblemente conversación eliminada:", conversationId);
          addToBlacklist(conversationId);
          setShouldStop(true);
          return false;
        }
        console.error("❌ Error en la petición API:", apiError);
        return false;
      }
    } catch (err) {
      console.error("❌ Error general al obtener información de usuario:", err);
      return false;
    }
  };

  // Función auxiliar para forzar actualización de información de usuario
  const forceUpdateUserInfo = async () => {
    if (!conversationId || !userId) return;
    
    console.log("🔄 Forzando actualización de información de usuario");
    const success = await fetchOtherUserInfo(conversationId, userId);
    
    if (!success && !otherUser) {
      // Si no tenemos información del usuario, intentar obtenerla de la lista de conversaciones
      console.log("🔄 Intentando obtener info de usuario desde lista de conversaciones");
      await checkAndUpdateConversationId();
    }
    
    return success;
  };

  useEffect(() => {
    // Si tenemos ID de conversación y de usuario, configurar intervalo para actualizar info de usuario
    if (conversationId && userId && !shouldStop && initialLoadComplete) {
      // Esperar un poco antes de iniciar el intervalo para dar tiempo a la carga inicial
      const delayTimeout = setTimeout(() => {
        
        // Determinar intervalo basado en si tenemos datos del usuario
        const intervalTime = otherUser ? 10000 : 3000; // 3 segundos si no hay usuario, 10 si ya lo tenemos
        console.log("🔄 Configurando intervalo de usuario cada", intervalTime/1000, "segundos");
        
        const userInfoInterval = setInterval(async () => {
          // No ejecutar si shouldStop está activado
          if (shouldStop) {
            console.log("🛑 Deteniendo intervalo de actualización de usuario por shouldStop");
            clearInterval(userInfoInterval);
            userInfoIntervalRef.current = null;
            return;
          }

          // Verificar que aún tenemos datos válidos
          if (!conversationId || !isValidId(conversationId)) {
            console.log("🛑 Deteniendo intervalo de actualización por conversationId inválido");
            clearInterval(userInfoInterval);
            userInfoIntervalRef.current = null;
            return;
          }

          // Verificar si el ID está en la lista negra
          if (isBlacklisted(conversationId)) {
            console.log("🚫 ID está en lista negra, deteniendo intervalo de actualización de usuario:", conversationId);
            clearInterval(userInfoInterval);
            userInfoIntervalRef.current = null;
            return;
          }

          if (!userId) {
            console.log("🛑 Deteniendo intervalo de actualización por userId inexistente");
            clearInterval(userInfoInterval);
            userInfoIntervalRef.current = null;
            return;
          }

          // Actualizar información del usuario periódicamente pero con manejo de errores silencioso
          try {
            const success = await fetchOtherUserInfo(conversationId, userId);
            // Si no se pudo obtener la información, solo logear, no detener el intervalo
            if (!success) {
              console.log("⚠️ No se pudo actualizar información del usuario, reintentando en el próximo intervalo");
            }
          } catch (error) {
            console.error("❌ Error en intervalo de actualización:", error);
            // Solo limpiar intervalo en caso de errores persistentes
            clearInterval(userInfoInterval);
            userInfoIntervalRef.current = null;
          }
        }, intervalTime);
        
        // Guardar la referencia del intervalo
        userInfoIntervalRef.current = userInfoInterval;
        
        // Limpiar intervalos cuando el componente se desmonte
        return () => {
          console.log("🧹 Limpiando intervalo de actualización de usuario");
          clearInterval(userInfoInterval);
          userInfoIntervalRef.current = null;
        };
      }, 2000); // Reducir delay inicial a 2 segundos
      
      // Guardar la referencia del timeout
      userInfoTimeoutRef.current = delayTimeout;
      
      return () => {
        clearTimeout(delayTimeout);
        userInfoTimeoutRef.current = null;
      };
    }
  }, [conversationId, userId, shouldStop, initialLoadComplete, otherUser]); // Agregar otherUser como dependencia

  // Efecto de limpieza cuando el componente se desmonta
  useEffect(() => {
    return () => {
      console.log("🧹 Componente de chat desmontándose - limpiando procesos");
      setShouldStop(true);
      clearAllIntervals();
    };
  }, []);

  // Función para verificar y actualizar el conversationId actual
  const checkAndUpdateConversationId = async () => {
    if (!userId || !otherUser?.id) return;
    
    try {
      console.log("🔍 Verificando estado de conversación actual entre", userId, "y", otherUser.id);
      
      // Buscar la conversación más reciente entre estos usuarios
      const res = await apiFetch(`/conversations/user/${userId}`) as Response;
      
      if (res.ok) {
        const conversations = await res.json();
        
        console.log("📋 Conversaciones obtenidas:", conversations.map((conv: any) => ({
          id: conv.id,
          user: conv.user.nombre,
          status: conv.status
        })));
        
        // Encontrar la conversación con el otro usuario
        const currentConversation = conversations.find((conv: any) => 
          conv.user.id === otherUser.id
        );
        
        if (currentConversation) {
          console.log("🔄 Conversación encontrada:", currentConversation);
          console.log("🔍 Comparando IDs:", {
            actual: conversationId,
            nuevo: currentConversation.id,
            sonIguales: currentConversation.id === conversationId
          });
          
          // Actualizar conversationId si es diferente
          if (currentConversation.id !== conversationId) {
            console.log("🔄 ¡CONVERSACIÓN ACTUALIZADA DETECTADA!");
            console.log("📊 Cambio de ID:", {
              anterior: conversationId,
              nueva: currentConversation.id,
              tipo_anterior: typeof conversationId,
              tipo_nuevo: typeof currentConversation.id
            });
            
            // FORZAR actualización inmediata
            const newId = currentConversation.id.toString();
            setConversationId(newId);
            
            console.log("✅ ConversationId actualizado a:", newId);
            
            // Limpiar lista negra para el nuevo ID
            setBlacklistedIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(newId);
              console.log("🧹 Limpiando lista negra para ID:", newId);
              return newSet;
            });
          } else {
            console.log("✅ ConversationId ya está actualizado:", conversationId);
          }
          
          // Actualizar estado de la conversación SIEMPRE (esto es clave)
          const newStatus = currentConversation.status || 'accepted';
          const newIsCreator = currentConversation.isCreator || false;
          
          console.log("📊 Estados de conversación:", {
            anteriorStatus: conversationStatus,
            nuevoStatus: newStatus,
            anteriorIsCreator: isCreator,
            nuevoIsCreator: newIsCreator
          });
          
          // Actualizar estado incluso si parece igual para forzar re-render
          setConversationStatus(newStatus);
          setIsCreator(newIsCreator);
          
          // Si el estado cambió a accepted, forzar actualización inmediata
          if (newStatus === 'accepted' && conversationStatus !== 'accepted') {
            console.log("✅ ¡Conversación recién aceptada! Actualizando todo inmediatamente");
            
            // Múltiples actualizaciones para asegurar sincronización
            setTimeout(() => {
              silentFetchMessages();
            }, 100);
            
            setTimeout(() => {
              silentFetchMessages();
            }, 500);
            
            setTimeout(() => {
              silentFetchMessages();
            }, 1000);
          }
          
          // Cargar mensajes si el ID cambió
          if (currentConversation.id !== conversationId) {
            setTimeout(() => {
              silentFetchMessages();
            }, 300);
          }
        } else {
          console.log("⚠️ No se encontró conversación activa con este usuario - posiblemente eliminada");
          // Si la conversación actual no se encuentra, agregar a lista negra
          if (conversationId) {
            addToBlacklist(conversationId);
            setShouldStop(true);
          }
        }
      } else {
        // Manejo silencioso de errores
        if (res.status === 404) {
          console.log("📝 Lista de conversaciones no encontrada (404) - posiblemente usuario sin conversaciones");
        } else {
          console.error("❌ Error al obtener conversaciones:", res.status);
        }
      }
    } catch (err) {
      // Manejo silencioso de errores de parsing JSON
      if (err instanceof Error && (err.message?.includes('JSON') || err.message?.includes('Unexpected end of input'))) {
        console.log("📝 Error de parsing JSON en verificación de conversación - posiblemente datos eliminados");
        if (conversationId) {
          addToBlacklist(conversationId);
          setShouldStop(true);
        }
      } else {
        console.error("❌ Error al verificar conversación actual:", err);
      }
    }
  };

  // Efecto para verificar periódicamente si hay una nueva conversación
  useEffect(() => {
    if (userId && otherUser?.id) {
      // Verificar inmediatamente
      console.log("🔄 Iniciando verificación periódica de conversación");
      checkAndUpdateConversationId();
      
      // Determinar frecuencia basada en el estado de conversación
      const intervalTime = conversationStatus === 'pending' ? 2000 : 5000; // 2s si pendiente, 5s si no
      console.log(`⏰ Configurando intervalo de verificación cada ${intervalTime/1000}s (estado: ${conversationStatus})`);
      
      // Luego verificar periódicamente
      const interval = setInterval(() => {
        checkAndUpdateConversationId();
      }, intervalTime);
      
      return () => clearInterval(interval);
    }
  }, [userId, otherUser?.id, conversationStatus]); // Agregar conversationStatus como dependencia

  // Efecto adicional para verificar cuando se completa la carga inicial
  useEffect(() => {
    if (initialLoadComplete && userId && otherUser?.id) {
      console.log("🔄 Carga inicial completa, verificando conversación");
      setTimeout(() => {
        checkAndUpdateConversationId();
      }, 1000);
    }
  }, [initialLoadComplete, userId, otherUser?.id]);

  // Efecto para reaccionar a cambios en el estado de conversación
  useEffect(() => {
    console.log("🔄 Estado de conversación cambió a:", conversationStatus);
    
    if (conversationStatus === 'accepted' && conversationId && userId) {
      console.log("✅ Conversación aceptada, actualizando información inmediatamente");
      
      // Actualizar información del usuario inmediatamente
      if (conversationId && userId) {
        fetchOtherUserInfo(conversationId, userId);
      }
      
      // También verificar conversación por si hay cambios
      setTimeout(() => {
        checkAndUpdateConversationId();
      }, 100);
      
      // Cargar mensajes múltiples veces para asegurar sincronización
      setTimeout(() => {
        silentFetchMessages();
      }, 200);
      
      setTimeout(() => {
        silentFetchMessages();
      }, 800);
      
      setTimeout(() => {
        silentFetchMessages();
      }, 1500);
    }
    
    // Si está pendiente, verificar más frecuentemente
    if (conversationStatus === 'pending') {
      console.log("⏳ Conversación pendiente, configurando verificaciones frecuentes");
      
      const pendingCheckInterval = setInterval(() => {
        console.log("🔍 Verificación automática para conversación pendiente");
        checkAndUpdateConversationId();
      }, 3000); // Cada 3 segundos para conversaciones pendientes
      
      // Limpiar después de 2 minutos para evitar bucles infinitos
      setTimeout(() => {
        clearInterval(pendingCheckInterval);
      }, 120000);
      
      return () => clearInterval(pendingCheckInterval);
    }
  }, [conversationStatus, conversationId, userId]);

  // Efecto para cargar mensajes cuando se obtiene conversationId o información del usuario
  useEffect(() => {
    if (conversationId && otherUser && userId && !shouldStop) {
      console.log("🔄 Detectado conversationId y otherUser - cargando mensajes automáticamente");
      
      // Carga inmediata múltiple para asegurar que aparezcan
      silentFetchMessages();
      silentFetchMessages(); // Doble llamada inmediata
      
      // Llamadas de respaldo rápidas
      setTimeout(() => {
        silentFetchMessages();
      }, 200);
      
      setTimeout(() => {
        silentFetchMessages();
      }, 500);
    }
  }, [conversationId, otherUser, userId]); // Se ejecuta cuando cualquiera de estos cambie

  // Debugging: mostrar cuando cambia conversationId
  useEffect(() => {
    console.log("🆔 === CONVERSATION ID CAMBIÓ ===");
    console.log("🆔 Nuevo conversationId:", conversationId);
    console.log("🆔 Tipo:", typeof conversationId);
    console.log("🆔 Es válido:", conversationId && isValidId(conversationId));
    console.log("🆔 Está en lista negra:", conversationId ? isBlacklisted(conversationId) : false);
  }, [conversationId]);

  // Efecto adicional para actualizaciones más frecuentes después de enviar mensaje
  useEffect(() => {
    if (lastMessageSentAt && conversationId && userId) {
      console.log("🚀 Iniciando actualizaciones frecuentes después de enviar mensaje");
      
      // Intervalo más agresivo por 10 segundos después de enviar mensaje
      const aggressiveInterval = setInterval(() => {
        const timeSinceLastMessage = Date.now() - lastMessageSentAt;
        
        // Solo hacer actualizaciones frecuentes por 10 segundos
        if (timeSinceLastMessage > 10000) {
          console.log("⏰ 10 segundos pasados, deteniendo actualizaciones frecuentes");
          clearInterval(aggressiveInterval);
          setLastMessageSentAt(null);
          return;
        }
        
        silentFetchMessages();
      }, 300); // Cada 300ms por 10 segundos
      
      return () => {
        clearInterval(aggressiveInterval);
      };
    }
  }, [lastMessageSentAt, conversationId, userId]);

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
                {otherUser?.nombre || (shouldStop ? 'Redirigiendo...' : 'Cargando usuario...')}
              </Text>
              
              {/* Botón para forzar actualización si no hay usuario */}
              {!otherUser && !shouldStop && (
                <TouchableOpacity 
                  onPress={forceUpdateUserInfo}
                  style={{ marginLeft: 10, padding: 5 }}
                >
                  <Ionicons name="refresh" size={20} color="#FEF7FF" />
                </TouchableOpacity>
              )}
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
            {(() => {
              console.log("🔍 === INICIO RENDER MESSAGES ===");
              console.log("🔍 Estado actual en render:", {
                loading,
                initialLoadComplete,
                messagesLength: messages.length,
                conversationId,
                userId,
                otherUser: otherUser?.nombre,
                shouldStop
              });
              
              // Log detallado de los mensajes para debugging
              if (messages.length > 0) {
                console.log("📋 Mensajes a renderizar:", messages.map(msg => ({
                  id: msg.id,
                  content: msg.content || msg.contenido,
                  sender_id: msg.sender_id,
                  conversation_id: msg.conversation_id
                })));
              }
              
              if (loading && !initialLoadComplete) {
                console.log("🔄 Mostrando pantalla de carga");
                return (
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#403796" />
                    <Text style={{ marginTop: 10, color: '#403796' }}>Cargando...</Text>
                  </View>
                );
              } else if (messages.length === 0) {
                console.log("📭 Mostrando pantalla de mensajes vacíos");
                return (
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
                );
              } else {
                console.log("📱 Renderizando FlatList con", messages.length, "mensajes");
                console.log("🔍 === FIN RENDER MESSAGES ===");
                return (
                  <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id?.toString() || Math.random().toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === 'ios' ? 160 : 140 }}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
                  />
                );
              }
            })()}
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