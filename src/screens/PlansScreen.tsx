import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PlansScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Planos de Treino</Text>
      <Text style={styles.subtitle}>
        Aqui vais poder criar, editar e visualizar os teus planos de treino
        usando os exercícios da API Wger.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});


