import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { apiFetch } from '../../../lib/api';
import { getCurrentUserId } from '../../../lib/user';
import { Ionicons } from '@expo/vector-icons';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUserId().then(async (id) => {
      console.log("ID de usuario actual:", id);
      setUserId(id);
      if (id) {
        fetchUsersInSameCity(id);
      } else {
        console.error("No se pudo obtener el ID del usuario actual");
        setLoading(false);
        setError("No se pudo identificar al usuario");
      }
    });
  }, []);

  const fetchUsersInSameCity = async (myId: string) => {
    setLoading(true);
    try {
      console.log("Buscando usuarios en la misma ciudad para:", myId);
      const res = await apiFetch(`/travel_days/usuarios_misma_ciudad/${myId}`);
      
      // Verificar si la respuesta es exitosa
      if (!res.ok) {
        const errorData = await res.text();
        console.error("Error en la respuesta:", res.status, errorData);
        setError(`Error del servidor: ${res.status}`);
        setUsers([]);
        return;
      }
      
      let data: User[] = await res.json();
      console.log("Usuarios encontrados:", data.length, data);
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error("Error al buscar usuarios:", err);
      setUsers([]);
      setError("Error al comunicarse con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleCrearChat = async (otherUserId: string) => {
    if (!userId) return;
    try {
      console.log("Creando chat entre usuarios", userId, "y", otherUserId);
      // Crear conversación (si no existe)
      const res = await apiFetch('/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id1: userId, 
          user_id2: otherUserId 
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        console.error("Error al crear chat:", res.status, errorData);
        Alert.alert("Error", "No se pudo crear el chat");
        return;
      }
      
      // Opcional: mostrar feedback
      Alert.alert('Éxito', '¡Chat creado! Ahora puedes verlo en "Chats creados".');
    } catch (err) {
      console.error("Error al crear chat:", err);
      Alert.alert("Error", "No se pudo crear el chat");
    }
  };

  const handleRetry = () => {
    if (userId) {
      fetchUsersInSameCity(userId);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#C76F40" style={{ marginTop: 40 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.header}>Usuarios activos en tu ciudad</Text>
      <Text style={styles.subHeader}>Usuarios geolocalizados en las últimas 24 horas</Text>
      
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryText}>Intentar de nuevo</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.userItem}>
              <View style={styles.avatar}>
                {item.foto_perfil ? (
                  <Image 
                    source={{ uri: item.foto_perfil }} 
                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff3e9' }} 
                    defaultSource={require('../../../assets/images/avatar.png')}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Image
                      source={require('../../../assets/images/avatar.png')}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                    />
                  </View>
                )}
              </View>
              <Text style={styles.name}>{item.nombre}</Text>
              <TouchableOpacity style={styles.btn} onPress={() => handleCrearChat(item.id)}>
                <Text style={styles.btnText}>Crear chat</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40, color: '#999' }}>No hay usuarios activos en tu ciudad en las últimas 24 horas.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C76F40',
    marginBottom: 4,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 12,
    color: '#888',
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
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 