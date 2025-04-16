//Todo esto se puede quitar sin problemas
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// Add the default export that's missing
export default function SobreScreen() {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Sobre TravelQuest</Text>
        <Text style={styles.paragraph}>
          TravelQuest es una aplicación que te permite descubrir nuevos lugares
          y completar misiones mientras viajas.
        </Text>
        <Text style={styles.paragraph}>
          Explora ciudades, completa misiones y guarda tus recuerdos en el diario de viaje.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4EDE0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    color: '#333',
  }
});