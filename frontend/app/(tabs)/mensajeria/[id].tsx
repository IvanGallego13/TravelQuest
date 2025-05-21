import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { apiFetch } from '../../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUserId } from '../../../lib/user';
import { supabase } from '../../../lib/supabase';
import * as Haptics from 'expo-haptics';

interface Message {
  id: number;
  contenido: string;
  id_emisor: number;
  id_receptor: number;
  created_at: string;
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<{ nombre: string; foto_perfil?: string } | null>(null);

  useEffect(() => {
    getCurrentUserId().then(setUserId);
    fetchMessages();
    fetchOtherUser();
    const interval = setInterval(fetchMessages, 3000); // Polling cada 3 segundos
    // Suscripción en tiempo real
    const subscription = supabase
      .channel('mensajes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Mensajes' }, (payload) => {
        fetchMessages();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      })
      .subscribe();
    return () => {
      clearInterval(interval);
      supabase.removeChannel(subscription);
    };
  }, [id]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/mensajes/${id}`);
      const data = await res.json();
      setMessages(data);
      // Marcar como leídos los mensajes recibidos y no leídos
      if (userId) {
        const unread = data.filter((msg: any) => msg.id_receptor?.toString() === userId && !msg.leido);
        for (const msg of unread) {
          await apiFetch(`/mensajes/${msg.id}/read`, { method: 'PUT' });
        }
      }
    } catch (err) {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherUser = async () => {
    const myId = await getCurrentUserId();
    if (!myId) return;
    const otherId = id && myId !== id ? id : null;
    if (!otherId) return;
    try {
      const res = await apiFetch(`/users/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [otherId] }),
      });
      const users = await res.json();
      setOtherUser(users[0] || null);
    } catch (err) {
      setOtherUser(null);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !userId) return;
    try {
      await apiFetch('/mensajes', {
        method: 'POST',
        body: JSON.stringify({ id_emisor: userId, id_receptor: id, contenido: input }),
      });
      setInput('');
      fetchMessages();
    } catch (err) {}
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMine = userId && item.id_emisor?.toString() === userId;
    return (
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={styles.messageText}>{item.contenido}</Text>
        <Text style={styles.time}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.header}>
          {otherUser?.foto_perfil ? (
            <Image source={{ uri: otherUser.foto_perfil }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-circle" size={40} color="#C76F40" style={styles.avatar} />
          )}
          <Text style={styles.headerTitle}>{otherUser?.nombre || 'Usuario'}</Text>
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Escribe un mensaje..."
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Ionicons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#222',
    fontSize: 16,
  },
  time: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
    color: '#222',
  },
  sendBtn: {
    backgroundColor: '#C76F40',
    borderRadius: 20,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C76F40',
    marginLeft: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff3e9',
  },
}); 