//Todo esto se puede quitar sin problemas
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Add the default export that's missing
export default function SobreScreen() {
  const router = useRouter();
  return (
    <ImageBackground
      source={require('../../../assets/images/fondo.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* Capa blanca translúcida */}
      <View className="flex-1 bg-white/20 px-6 pt-14">

        {/* Flecha atrás */}
        <TouchableOpacity onPress={() => router.push('/usuario/usuario')} className="absolute top-12 left-4 z-10 bg-white rounded-full p-1">
          <Ionicons name="arrow-back" size={28} color="#000" />
        </TouchableOpacity>

        {/* Tarjeta de contenido */}
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="mt-12">
          <View className="bg-white/90 rounded-2xl shadow-md p-6">
            <Text className="text-2xl font-bold text-black text-center mb-4">
              Sobre TravelQuest
            </Text>
            <Text className="text-base text-black leading-6 text-justify">
              TravelQuest es una app diseñada para inspirar a los viajeros a descubrir los secretos de cada ciudad mediante misiones interactivas, desafíos y recompensas. Cada reto está pensado para ayudarte a ver el mundo con nuevos ojos, incentivando la curiosidad, la creatividad y el espíritu aventurero.
              {'\n\n'}
              Nuestro objetivo es transformar cada paseo en una experiencia única, permitiéndote registrar tus recuerdos, progresar como viajero y compartir tus logros con la comunidad.
              {'\n\n'}
              Desarrollado con cariño por el equipo de TravelQuest ✨
            </Text>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}
