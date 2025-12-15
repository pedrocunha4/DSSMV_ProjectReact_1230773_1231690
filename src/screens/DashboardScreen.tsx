import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { AppDispatch, RootState } from '../store/store';
import { logout } from '../store/authSlice';

export default function DashboardScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { username } = useSelector((state: RootState) => state.auth);

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
        >
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, styles.iconCirclePlans]}>
              <Text style={styles.iconEmoji}>📅</Text>
            </View>
          </View>
          <Text style={styles.optionText}>Planos de Treino</Text>
        </TouchableOpacity>

        {/* Card Exercícios */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('Exercises')}
        >
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, styles.iconCircleExercises]}>
              <Text style={styles.iconEmoji}>🏋️</Text>
            </View>
          </View>
          <Text style={styles.optionText}>Exercícios</Text>
        </TouchableOpacity>

        {/* Botão Sair */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  optionCard: {
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
  },
  iconContainer: {
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  iconCirclePlans: {
    backgroundColor: '#ADD8E6', // Azul claro (sky blue)
  },
  iconCircleExercises: {
    backgroundColor: '#FF8C00', // Laranja (dark orange)
  },
  iconEmoji: {
    fontSize: 32,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});