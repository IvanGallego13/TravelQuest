import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';



export default function TabLayout(){
    return(
        
      <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarActiveTintColor: '#ffffff',     // ✅ Iconos activos blancos
        tabBarInactiveTintColor: '#ffffff',   // ✅ Iconos inactivos también blancos
        tabBarStyle: {
          backgroundColor: '#C76F40',         // ✅ Terracota
          height: 75,                         // ✅ Más altura
          borderTopWidth: 0,                 // Elimina borde superior si lo hubiera
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}
    >
        <Tabs.Screen
        name="crear/index"
        options={{
          title: 'Crear',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.and.pencil" color={color} />,
        }}
        />
        <Tabs.Screen
          name="diario/diario"
          options={{
            title: 'diario',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
          }}
        />
        <Tabs.Screen
          name="misiones/listaMisiones"
          options={{
            title: 'misiones',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="airplane" color={color} />,
          }}
        />
        <Tabs.Screen
          name="usuario/usuario"
          options={{
            title: 'usuario',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
      {/*Pantallas que no se mostraran en el menú inferior de navegación*/}
       <Tabs.Screen
        name="crear/2dificultad"
        options={{
          href: null, 
        }}
      />
      <Tabs.Screen
        name="crear/2.2entradaDiario"
        options={{
          href: null, 
        }}
      />
      <Tabs.Screen
        name="crear/3misionGenerada"
        options={{
          href: null, 
        }}
      />
      <Tabs.Screen
        name="diario/2ciudad"
        options={{
          href: null, 
        }}
      />
      <Tabs.Screen
        name="diario/3dia"
        options={{
          href: null, 
        }}
      />
       
        <Tabs.Screen
          name="misiones/detallesMision"
          options={{
            href: null, 
          }}
        />
        <Tabs.Screen
          name="usuario/2ranking"
          options={{
            href: null, 
          }}
        />
        <Tabs.Screen
          name="usuario/editar"
          options={{
            href: null, 
          }}
        />
        <Tabs.Screen
          name="usuario/editar-avatar"
          options={{
            href: null, 
          }}
        />

    </Tabs>
    );
}