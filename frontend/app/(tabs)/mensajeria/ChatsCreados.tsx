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

  const fetchConversations = async (myId: string) => {
    setLoading(true);
    try {
      // Obtener conversaciones donde el usuario es participante
      const res = await apiFetch(`/conversations/user/${myId}`);
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (conversation: Conversation) => {
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

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handleOpenChat(item)}>
      <View style={styles.avatar}>
        {item.user.foto_perfil ? (
          <Image source={{ uri: item.user.foto_perfil }} style={{ width: 40, height: 40, borderRadius: 20 }} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-circle" size={40} color="#C76F40" />
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.user.nombre}</Text>
        {item.user.username && (
          <Text style={styles.username}>@{item.user.username}</Text>
        )}
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <Text style={styles.time}>{item.lastDate ? new Date(item.lastDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
      {item.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#C76F40" style={{ marginTop: 40 }} />;
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    color: '#C76F40',
    marginTop: 2,
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  time: {
    fontSize: 12,
    color: '#C76F40',
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
}); 