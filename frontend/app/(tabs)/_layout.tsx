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
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
          }),
        }}>
        <Tabs.Screen
        name="index"
        options={{
          title: 'Crear',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="square.and.pencil" color={color} />,
        }}
        />
        <Tabs.Screen
          name="diario"
          options={{
            title: 'diario',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
          }}
        />
        <Tabs.Screen
          name="misiones"
          options={{
            title: 'misiones',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="airplane" color={color} />,
          }}
        />
        <Tabs.Screen
          name="usuario"
          options={{
            title: 'usuario',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
      {/*Pantallas que no se mostraran en el menú inferior de navegación*/}
       <Tabs.Screen
        name="detalles/uno"
        options={{
          href: null, 
        }}
      />

    </Tabs>
    );
}