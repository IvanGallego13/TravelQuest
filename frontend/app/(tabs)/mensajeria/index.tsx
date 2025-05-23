import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import ChatsCreados from './ChatsCreados';
import UsuariosCiudad from './UsuariosCiudad';

export default function MensajeriaScreen() {
  const [tab, setTab] = useState<'chats' | 'ciudad'>('chats');

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'chats' && styles.tabBtnActive]}
          onPress={() => setTab('chats')}
        >
          <Text style={[styles.tabText, tab === 'chats' && styles.tabTextActive]}>Chats creados</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'ciudad' && styles.tabBtnActive]}
          onPress={() => setTab('ciudad')}
        >
          <Text style={[styles.tabText, tab === 'ciudad' && styles.tabTextActive]}>Usuarios en tu ciudad</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flex: 1 }}>
        {tab === 'chats' ? <ChatsCreados /> : <UsuariosCiudad />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 0,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabBtnActive: {
    borderColor: '#C76F40',
    backgroundColor: '#fff3e9',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#C76F40',
  },
}); 