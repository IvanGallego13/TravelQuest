import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../../lib/api';
import { getCurrentUserId } from '../../../lib/user';
import Ionicons from '@expo/vector-icons/Ionicons';

// Función auxiliar para validar si un ID es un UUID o un ID numérico
const isValidId = (id: string): boolean => {
  // Validar si es un UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  // Validar si es un número simple
  const numericRegex = /^[0-9]+$/;
  
  return uuidRegex.test(id) || numericRegex.test(id);
};

interface Conversation {
  id: string;
  user: {
    id: string;
    nombre: string;
    foto_perfil?: string;
    username?: string;
  };
  lastMessage: string;
  lastDate: string;
  unread: number;
  status?: string;
  isPending?: boolean;
  isCreator?: boolean;
}

export default function ChatsCreados() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentUserId().then(id => {
      setUserId(id);
      if (id) fetchConversations(id);
    });
  }, []);

  // Auto-actualización cada segundo
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (userId) {
      intervalId = setInterval(() => {
        // Actualizar conversaciones silenciosamente cada 3 segundos (sin mostrar loading)
        fetchConversations(userId, false);
      }, 3000); // Cambiar de 1000 a 3000 para reducir carga
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userId]);

  const fetchConversations = async (myId: string, showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    
    try {
      // Obtener conversaciones donde el usuario es participante
      const res = await apiFetch(`/conversations/user/${myId}`) as Response;
      
      if (res.ok) {
        const data = await res.json();
        
        // Filtrar conversaciones válidas (que tienen datos de usuario)
        const validConversations = data.filter((conv: Conversation) => 
          conv.user && conv.user.id && conv.user.nombre && conv.user.nombre !== 'Usuario desconocido'
        );
        
        console.log(`✅ Se encontraron ${data.length} conversaciones, ${validConversations.length} válidas`);
        setConversations(validConversations);
      } else {
        console.error("❌ Error al obtener conversaciones:", res.status);
        // No limpiar conversaciones en caso de error para evitar parpadeos
      }
    } catch (err) {
      console.error("❌ Error en fetchConversations:", err);
      // No limpiar conversaciones en caso de error
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleOpenChat = (conversation: Conversation) => {
    // No permitir abrir chats pendientes si soy el receptor
    if (conversation.isPending && !conversation.isCreator) {
      Alert.alert(
        "Chat pendiente",
        "Primero debes aceptar esta solicitud de chat para poder conversar."
      );
      return;
    }
    
    // Depurar qué información tenemos de la conversación
    console.log("🔍 Información de conversación:", {
      conversationId: conversation.id,
      userId: conversation.user.id,
      nombre: conversation.user.nombre,
      username: conversation.user.username
    });
    
    // SIEMPRE usar el ID de conversación si está disponible
    if (conversation.id) {
      console.log("✅ Usando ID de conversación para chat:", conversation.id);
      // Forzar navegación tras un breve timeout para asegurar que se inicia limpia
      setTimeout(() => {
        router.push({ pathname: '/(tabs)/mensajeria/[id]', params: { id: conversation.id } });
      }, 100);
      return;
    }
    
    // Avisar al usuario si no tenemos ID de conversación
    console.error("❌ No hay ID de conversación disponible");
    Alert.alert(
      "Error", 
      "No se puede abrir esta conversación porque no tiene un identificador válido."
    );
  };

  const handleAcceptChat = async (conversation: Conversation) => {
    if (!userId) return;
    
    try {
      const res = await apiFetch(`/conversations/${conversation.id}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      }) as Response;
      
      if (!res.ok) {
        const errorData = await res.text();
        console.error("Error al aceptar chat:", res.status, errorData);
        Alert.alert("Error", "No se pudo aceptar la solicitud de chat");
        return;
      }
      
      // Actualizar la lista de conversaciones
      Alert.alert("Éxito", "Has aceptado la solicitud de chat");
      if (userId) fetchConversations(userId, false);
    } catch (err) {
      console.error("Error al aceptar chat:", err);
      Alert.alert("Error", "No se pudo aceptar la solicitud de chat");
    }
  };

  const handleRejectChat = async (conversation: Conversation) => {
    if (!userId) return;
    
    try {
      const res = await apiFetch(`/conversations/${conversation.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      }) as Response;
      
      if (!res.ok) {
        const errorData = await res.text();
        console.error("Error al rechazar chat:", res.status, errorData);
        Alert.alert("Error", "No se pudo rechazar la solicitud de chat");
        return;
      }
      
      // Eliminar la conversación de la lista local
      setConversations(prevConversations => 
        prevConversations.filter(conv => conv.id !== conversation.id)
      );
      
      // Mostrar confirmación
      Alert.alert("Éxito", "Has rechazado la solicitud de chat");
    } catch (err) {
      console.error("Error al rechazar chat:", err);
      Alert.alert("Error", "No se pudo rechazar la solicitud de chat");
    }
  };

  const handleDeleteChat = async (conversation: Conversation) => {
    if (!userId) return;
    
    // Mostrar confirmación antes de eliminar
    Alert.alert(
      "Eliminar chat",
      "¿Estás seguro de que quieres eliminar este chat? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              console.log("🗑️ Eliminando conversación:", conversation.id);
              
              // Eliminar inmediatamente de la lista local para feedback instantáneo
              setConversations(prevConversations => 
                prevConversations.filter(conv => conv.id !== conversation.id)
              );
              
              const res = await apiFetch(`/conversations/${conversation.id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' }
              }) as Response;
              
              if (res.ok) {
                console.log("✅ Conversación eliminada exitosamente del servidor");
                // Actualizar la lista para asegurar consistencia
                if (userId) {
                  setTimeout(() => fetchConversations(userId, false), 500);
                }
              } else {
                console.error("❌ Error al eliminar chat en servidor:", res.status);
                // Si falló en el servidor, restaurar la conversación en la lista
                if (userId) {
                  fetchConversations(userId, false);
                }
                Alert.alert("Error", "No se pudo eliminar el chat en el servidor");
              }
            } catch (err) {
              console.error("❌ Error al eliminar chat:", err);
              // Si hubo error, actualizar la lista para mostrar el estado real
              if (userId) {
                fetchConversations(userId, false);
              }
              Alert.alert("Error", "Ocurrió un error al eliminar el chat");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <View style={[
      styles.chatItem, 
      item.isPending && !item.isCreator && styles.pendingChat
    ]}>
      <TouchableOpacity 
        style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
        onPress={() => handleOpenChat(item)}
        disabled={item.isPending && !item.isCreator}
      >
        <View style={styles.avatar}>
          {item.user.foto_perfil ? (
            <Image 
              source={{ uri: item.user.foto_perfil }} 
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff3e9' }} 
              defaultSource={require('../../../assets/images/avatar.png')}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#403796" />
            </View>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.user.nombre}</Text>
          {item.user.username && (
            <Text style={styles.username}>@{item.user.username}</Text>
          )}
          {item.isPending && !item.isCreator ? (
            <Text style={styles.pendingText}>Solicitud de chat pendiente</Text>
          ) : (
            <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
          )}
        </View>
        <Text style={styles.time}>{item.lastDate ? new Date(item.lastDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
        {item.unread > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Botones de aceptar/rechazar para chats pendientes donde el usuario es el receptor */}
      {item.isPending && !item.isCreator && (
        <View style={styles.pendingButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.acceptButton]} 
            onPress={() => handleAcceptChat(item)}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Aceptar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.rejectButton]} 
            onPress={() => handleRejectChat(item)}
          >
            <Ionicons name="close" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Rechazar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botón de eliminar chat (aparece solo después de aceptar) */}
      {!item.isPending && (
        <View style={styles.deleteButtonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => handleDeleteChat(item)}
          >
            <Ionicons name="trash" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#403796" style={{ marginTop: 40 }} />;
  }

  return (
    <FlatList
      data={conversations}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>No tienes chats aún.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: 'column',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pendingChat: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFAB40',
    backgroundColor: '#FFF8E1',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff3e9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  username: {
    fontSize: 14,
    color: '#403796',
    marginTop: 2,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  pendingText: {
    fontSize: 14,
    color: '#FFAB40',
    fontWeight: '500',
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: '',
    marginLeft: 8,
  },
  unreadBadge: {
    backgroundColor: '#C76F40',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  pendingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  deleteButtonContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  deleteButton: {
    backgroundColor: '#FF5252',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
}); 