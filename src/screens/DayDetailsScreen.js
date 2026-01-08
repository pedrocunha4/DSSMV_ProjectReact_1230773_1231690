import React, { useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSets, clearSets } from '../store/setsSlice';
import { fetchExercises } from '../store/exercisesSlice'; // Importa a ação de buscar exercícios
import { useNavigation, useRoute } from '@react-navigation/native';

export default function DayDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { dayId, dayName } = route.params;

  const dispatch = useDispatch();
  const { items: slots, status: setsStatus } = useSelector((state) => state.sets);
  const { items: exercises, status: exStatus } = useSelector((state) => state.exercises);

  useEffect(() => {
    // Carregar os slots do dia
    dispatch(fetchSets(dayId));

    // CORREÇÃO: Se a lista global de exercícios estiver vazia, carrega-os
    if (exercises.length === 0 && exStatus !== 'loading') {
      dispatch(fetchExercises());
    }

    return () => dispatch(clearSets());
  }, [dispatch, dayId]);

  const mappedData = useMemo(() => {
    return slots.map(slot => {
      const entry = slot.entries && slot.entries.length > 0 ? slot.entries[0] : null;

      if (entry) {
        // Tenta encontrar o nome no array global de exercícios
        const exerciseDetail = exercises.find(ex => ex.id === entry.exercise);
        return {
          id: slot.id,
          // Se ainda estiver a carregar ou não encontrar, mostra "Carregando..." em vez de "ID: 12"
          exerciseName: exerciseDetail ? exerciseDetail.name : "A carregar nome...",
        };
      }
      return null;
    }).filter(item => item !== null);
  }, [slots, exercises]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.exName}>{item.exerciseName}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{dayName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {setsStatus === 'loading' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={mappedData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💪</Text>
              <Text style={styles.emptyText}>Ainda nenhum exercício adicionado</Text>
              <Text style={styles.emptySubtext}>Adicione o seu primeiro exercício!</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ExerciseSelect', { dayId })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#007AFF', flexDirection: 'row', alignItems: 'center', paddingTop: 45, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { padding: 8 },
  backIcon: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  headerSpacer: { width: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16, paddingBottom: 100 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 22, marginBottom: 14, elevation: 4 },
  exName: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#333333', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#666666', textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', elevation: 8 },
  fabText: { fontSize: 32, color: '#FFFFFF', fontWeight: '300' },
});