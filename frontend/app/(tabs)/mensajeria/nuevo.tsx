import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../../lib/api';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUserId } from '../../../lib/user';

// Función auxiliar para validar si un ID es un UUID
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

interface User {
  id: string;
  nombre: string;
  foto_perfil?: string;
  username?: string;
}

export default function NuevoChatScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const setup = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
      console.log("👤 Usuario actual:", userId);
      
      await fetchUsers();
    };
    
    setup();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log("🔍 Obteniendo lista de usuarios");
      const res = await apiFetch('/users');
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Error al obtener usuarios:", errorText);
        throw new Error(errorText);
      }
      
      const data = await res.json();
      console.log(`✅ Obtenidos ${data.length} usuarios:`, data.map((u: User) => `${u.nombre} (${u.id})`).join(', '));
      
      const filteredUsers = currentUserId 
        ? data.filter((user: User) => user.id !== currentUserId)
        : data;
        
      console.log(`📋 Mostrando ${filteredUsers.length} usuarios (excluyendo usuario actual)`);
      setUsers(filteredUsers);
    } catch (err) {
      console.error("❌ Error al cargar usuarios:", err);
      Alert.alert("Error", "No se pudieron cargar los usuarios");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = (user: User) => {
    console.log("🔄 Iniciando chat con usuario:", user);
    
    if (!user) {
      console.error("❌ Usuario inválido");
      Alert.alert("Error", "Usuario inválido");
      return;
    }
    
    // Preferir usar el nombre de usuario si está disponible
    if (user.username) {
      console.log("🔄 Usando nombre de usuario para el chat:", user.username);
      router.push({ pathname: '/(tabs)/mensajeria/[id]', params: { id: user.username } });
      return;
    }
    
    // Si no hay nombre de usuario, usar el ID
    // Verificar que el ID sea un UUID válido
    if (!isValidUUID(user.id)) {
      console.error("❌ ID de usuario no es un UUID válido:", user.id);
      Alert.alert("Error", "El ID de usuario no es válido. Por favor, selecciona otro usuario.");
      return;
    }
    
    router.push({ pathname: '/(tabs)/mensajeria/[id]', params: { id: user.id } });
  };

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity 
      style={styles.userItem} 
      onPress={() => handleStartChat(item)}
    >
      <View style={styles.avatar}>
        {item.foto_perfil ? (
          <Image source={{ uri: item.foto_perfil }} style={{ width: 40, height: 40, borderRadius: 20 }} />
        ) : (
          <Ionicons name="person-circle" size={40} color="#C76F40" />
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.name}>{item.nombre}</Text>
        {item.username ? (
          <Text style={styles.username}>@{item.username}</Text>
        ) : (
          <Text style={styles.userId}>ID: {item.id.substring(0, 8)}...</Text>
        )}
      </View>
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
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No hay usuarios disponibles</Text>
            </View>
          }
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
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
  },
  username: {
    fontSize: 14,
    color: '#C76F40',
    marginTop: 2,
    fontWeight: '500',
  },
  userId: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 16,
  },
}); 