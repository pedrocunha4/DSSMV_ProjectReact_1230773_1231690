import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../store/store';

export default function DashboardScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { user } = useSelector((state: RootState) => state.auth);
  const username = user?.username || 'utilizador';

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View style={styles.container}>
      {/* Header Azul */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>PP Workout</Text>
      </View>

      {/* Conteúdo Principal */}
      <View style={styles.content}>
        {/* Card de Boas-vindas */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Olá, {username?.toLowerCase() || 'utilizador'}!</Text>
          <Text style={styles.welcomeSubtitle}>Escolha uma opção para começar</Text>
        </View>

        {/* Card Planos de Treino */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('Plans')}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, styles.iconCirclePlans]}>
              <Text style={styles.iconEmoji}>📅</Text>
            </View>
          </View>
          <Text style={styles.optionText}>Planos de Treino</Text>
          <Text style={styles.optionSubtext}>Gerir e criar planos</Text>
        </TouchableOpacity>

        {/* Card Exercícios */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('Exercises')}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, styles.iconCircleExercises]}>
              <Text style={styles.iconEmoji}>🏋️</Text>
            </View>
          </View>
          <Text style={styles.optionText}>Exercícios</Text>
          <Text style={styles.optionSubtext}>Explorar exercícios</Text>
        </TouchableOpacity>

        {/* Botão Sair */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#007AFF',
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  iconCirclePlans: {
    backgroundColor: '#E3F2FD',
  },
  iconCircleExercises: {
    backgroundColor: '#FFF3E0',
  },
  iconEmoji: {
    fontSize: 32,
  },
  optionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 4,
  },
  optionSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 'auto',
    marginBottom: 20,
    backgroundColor: '#FF3B30',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
