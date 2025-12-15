import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao PP Workout</Text>
      <Text style={styles.subtitle}>O que queres fazer hoje?</Text>

      <View style={styles.menuContainer}>
        {/* Botão para ir aos Planos */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.navigate('Plans')}
        >
          <Text style={styles.menuText}>🏋️ Meus Planos de Treino</Text>
        </TouchableOpacity>

        {/* Botão para ir aos Exercícios (Exemplo futuro) */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => console.log("Ir para exercícios")}
        >
          <Text style={styles.menuText}>💪 Lista de Exercícios</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => dispatch(logout())}
      >
        <Text style={styles.logoutText}>Sair da App</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 40 },
  menuContainer: { gap: 15 },
  menuButton: { backgroundColor: '#FFF', padding: 20, borderRadius: 10, elevation: 2, marginBottom: 15 },
  menuText: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', textAlign: 'center' },
  logoutButton: { marginTop: 30, padding: 15, backgroundColor: '#FF3B30', borderRadius: 8 },
  logoutText: { color: '#FFF', textAlign: 'center', fontWeight: 'bold' },
});