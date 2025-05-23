import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '../../components/HapticTab';
import { IconSymbol } from '../../components/ui/IconSymbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#504382',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.95)',
          height: 70,
          borderTopWidth: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
          paddingBottom: Platform.OS === 'ios' ? 16 : 10,
          paddingTop: 10,
        },
      }}
    >
      {/* Tabs visibles */}
      <Tabs.Screen
        name="crear/index"
        options={{
          title: 'Crear',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.and.pencil" color={color} />,
        }}
      />
      <Tabs.Screen
        name="crear/retos"
        options={{
          title: 'Retos',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="diario/diario"
        options={{
          title: 'Diario',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="misiones/listaMisiones"
        options={{
          title: 'Misiones',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="airplane" color={color} />,
        }}
      />
      <Tabs.Screen
        name="usuario/usuario"
        options={{
          title: 'Usuario',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mensajeria/index"
        options={{
          title: 'Mensajes',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="bubble.left.and.bubble.right.fill" color={color} />,
        }}
      />

      {/* Tabs ocultos */}
      <Tabs.Screen name="crear/2dificultad" options={{ href: null }} />
      <Tabs.Screen name="crear/2.2entradaDiario" options={{ href: null }} />
      <Tabs.Screen name="crear/3misionGenerada" options={{ href: null }} />
      <Tabs.Screen name="diario/2ciudad" options={{ href: null }} />
      <Tabs.Screen name="diario/3dia" options={{ href: null }} />
      <Tabs.Screen name="misiones/detallesMision" options={{ href: null }} />
      <Tabs.Screen name="usuario/2ranking" options={{ href: null }} />
      <Tabs.Screen name="usuario/editar" options={{ href: null }} />
      <Tabs.Screen name="usuario/editar-avatar" options={{ href: null }} />
      <Tabs.Screen name="usuario/sobre" options={{ href: null }} />
      <Tabs.Screen name="misiones/completadaMision" options={{ href: null }} />
      <Tabs.Screen name="misiones/historiaMision" options={{ href: null }} />
      <Tabs.Screen name="mensajeria/ChatsCreados" options={{ href: null }} />
      <Tabs.Screen name="mensajeria/nuevo" options={{ href: null }} />
      <Tabs.Screen name="mensajeria/UsuariosCiudad" options={{ href: null }} />
      <Tabs.Screen name="mensajeria/[id]" options={{ href: null }} />
      
    </Tabs>
  );
}
