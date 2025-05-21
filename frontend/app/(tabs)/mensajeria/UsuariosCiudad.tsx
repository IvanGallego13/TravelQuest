import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { apiFetch } from '../../../lib/api';
import { getCurrentUserId } from '../../../lib/user';

interface User {
  id: string;
  nombre: string;
  foto_perfil?: string;
}

export default function UsuariosCiudad() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUserId().then(async (id) => {
      setUserId(id);
      if (id) {
        fetchUsersInSameCity(id);
      }
    });
  }, []);

  const fetchUsersInSameCity = async (myId: string) => {
    setLoading(true);
    try {
      const res = await apiFetch(`/travel_days/usuarios_misma_ciudad/${myId}`);
      let data: User[] = await res.json();
      setUsers(data);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearChat = async (otherUserId: string) => {
    if (!userId) return;
    // Crear conversación (si no existe)
    await apiFetch('/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user1: userId, user2: otherUserId }),
    });
    // Opcional: mostrar feedback
    alert('¡Chat creado! Ahora puedes verlo en "Chats creados".');
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#C76F40" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.header}>Usuarios en tu ciudad</Text>
      <FlatList
        data={users}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <View style={styles.avatar}>
              {item.foto_perfil ? (
                <Image source={{ uri: item.foto_perfil }} style={{ width: 40, height: 40, borderRadius: 20 }} />
              ) : (
                <View style={styles.avatarPlaceholder} />
              )}
            </View>
            <Text style={styles.name}>{item.nombre}</Text>
            <TouchableOpacity style={styles.btn} onPress={() => handleCrearChat(item.id)}>
              <Text style={styles.btnText}>Crear chat</Text>
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>No hay usuarios en tu ciudad.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C76F40',
    marginBottom: 16,
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
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    flex: 1,
  },
  btn: {
    backgroundColor: '#C76F40',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 