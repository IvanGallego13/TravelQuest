import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../../lib/api';
import { Ionicons } from '@expo/vector-icons';

interface User {
  id: number;
  nombre: string;
  foto_perfil?: string;
}

export default function NuevoChatScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (userId: number) => {
    router.push({ pathname: '/(tabs)/mensajeria/[id]', params: { id: userId.toString() } });
  };

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleStartChat(item.id)}>
      <View style={styles.avatar}>
        {item.foto_perfil ? (
          <Image source={{ uri: item.foto_perfil }} style={{ width: 40, height: 40, borderRadius: 20 }} />
        ) : (
          <Ionicons name="person-circle" size={40} color="#C76F40" />
        )}
      </View>
      <Text style={styles.name}>{item.nombre}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Iniciar nuevo chat</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#C76F40" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>No hay usuarios disponibles.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#C76F40',
    marginBottom: 20,
    textAlign: 'center',
  },
  userItem: {
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
  name: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
  },
}); 