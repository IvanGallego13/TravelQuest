import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../../lib/api';
import { getCurrentUserId } from '../../../lib/user';

interface Conversation {
  id: string;
  user: {
    id: string;
    nombre: string;
    foto_perfil?: string;
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
      const res = await apiFetch(`/conversations/${myId}`);
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChat = (conversationId: string) => {
    router.push({ pathname: '/(tabs)/mensajeria/[id]', params: { id: conversationId } });
  };

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => handleOpenChat(item.id)}>
      <View style={styles.avatar}>
        {item.user.foto_perfil ? (
          <Image source={{ uri: item.user.foto_perfil }} style={{ width: 40, height: 40, borderRadius: 20 }} />
        ) : (
          <View style={styles.avatarPlaceholder} />
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.user.nombre}</Text>
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