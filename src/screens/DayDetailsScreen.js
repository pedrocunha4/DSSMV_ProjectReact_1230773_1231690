import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSets, clearSets } from '../store/setsSlice';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function DayDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { dayId, dayName } = route.params;

  const dispatch = useDispatch();
  const { items: sets, status } = useSelector((state) => state.sets);
  const { items: exercises } = useSelector((state) => state.exercises);

  useEffect(() => {
    dispatch(fetchSets(dayId));
    
    return () => {
      dispatch(clearSets());
    };
  }, [dispatch, dayId]);

  const setsWithExerciseNames = useMemo(() => {
    return sets.map(set => {
      // Pegar o primeiro setting do set
      const setting = set.settings && set.settings.length > 0 ? set.settings[0] : null;
      
      if (setting) {
        // Encontrar o exercício pelo exercise_base
        const exercise = exercises.find(ex => ex.id === setting.exercise_base);
        
        return {
          ...set,
          exerciseName: exercise ? exercise.name : `Exercício ID: ${setting.exercise_base}`,
          reps: setting.reps || 0
        };
      }
      
      return {
        ...set,
        exerciseName: 'Exercício desconhecido',
        reps: 0
      };
    });
  }, [sets, exercises]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.exName}>{item.exerciseName}</Text>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.exDetails}>
          {item.sets} séries × {item.reps} repetições
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{dayName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Lista de Exercícios */}
      {status === 'loading' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={setsWithExerciseNames}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💪</Text>
              <Text style={styles.emptyText}>Nenhum exercício adicionado</Text>
              <Text style={styles.emptySubtext}>Toca no botão abaixo para adicionar!</Text>
            </View>
          }
        />
      )}

      {/* Botão Flutuante */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ExerciseSelect', { dayId })}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 45,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardHeader: {
    marginBottom: 8,
  },
  exName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exDetails: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
});
