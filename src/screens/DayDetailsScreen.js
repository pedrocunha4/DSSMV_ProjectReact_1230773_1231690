import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSets } from '../store/setsSlice';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function DayDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { dayId, dayName } = route.params;

  const dispatch = useDispatch();
  const { items: sets } = useSelector((state) => state.sets);

  useEffect(() => {
    dispatch(fetchSets(dayId));
  }, [dispatch, dayId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{dayName}</Text>

      <FlatList
        data={sets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.exName}>Exercício ID: {item.exercise}</Text>
            <Text style={styles.exDetails}>{item.sets} séries x {item.reps} reps</Text>
          </View>
        )}
        ListEmptyComponent={<Text>Nenhum exercício adicionado.</Text>}
      />

      {/* Botão para ir para a lista de exercícios e selecionar um */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ExercisesSelect', { dayId })}
      >
        <Text style={styles.fabText}>+ Exercício</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10 },
  exName: { fontSize: 16, fontWeight: 'bold' },
  exDetails: { color: '#666' },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#007AFF', padding: 20, borderRadius: 50 },
  fabText: { color: '#fff', fontWeight: 'bold' }
});