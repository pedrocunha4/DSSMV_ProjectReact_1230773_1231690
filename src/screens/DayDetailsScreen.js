import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSets, clearSets } from '../store/setsSlice';
import { fetchExercises } from '../store/exercisesSlice';
import { useNavigation, useRoute } from '@react-navigation/native';
import EditEntryModal from '../components/plans/EditEntryModal';

export default function DayDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { dayId, dayName } = route.params;

  const dispatch = useDispatch();
  const { items: slots, status: setsStatus } = useSelector((state) => state.sets);
  const { items: exercises, status: exStatus } = useSelector((state) => state.exercises);

  const [editVisible, setEditVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    dispatch(fetchSets(dayId));

    if (exercises.length === 0 && exStatus !== 'loading') {
      dispatch(fetchExercises());
    }

    return () => dispatch(clearSets());
  }, [dispatch, dayId, exercises.length, exStatus]);

  const mappedData = useMemo(() => {
    return slots.map(slot => {
      const entry = slot.entries && slot.entries.length > 0 ? slot.entries[0] : null;

      if (entry) {
        const exerciseDetail = exercises.find(ex => ex.id === entry.exercise);
        const setsCount = typeof entry.sets === 'number' ? entry.sets : 0;
        const reps = typeof entry.reps === 'number' ? entry.reps : 0;
        const comment = typeof entry.comment === 'string' ? entry.comment.trim() : '';
        return {
          id: slot.id,
          entry,
          exerciseName: exerciseDetail ? exerciseDetail.name : "A carregar nome...",
          setsLabel: setsCount > 0 && reps > 0 ? `${setsCount} X ${reps}` : null,
          comment,
        };
      }
      return null;
    }).filter(item => item !== null);
  }, [slots, exercises]);

  const openEdit = (entry) => {
    setSelectedEntry(entry);
    setEditVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => openEdit(item.entry)}>
      <Text style={styles.exName}>{item.exerciseName}</Text>
      {item.setsLabel ? (
        <Text style={styles.meta}>{item.setsLabel}</Text>
      ) : (
        <Text style={styles.metaMuted}>Toca para definir sets e reps</Text>
      )}
      {item.comment ? (
        <Text style={styles.comment} numberOfLines={1} ellipsizeMode="tail">{item.comment}</Text>
      ) : null}
    </TouchableOpacity>
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

      <EditEntryModal visible={editVisible} entry={selectedEntry} onClose={() => setEditVisible(false)} />
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
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 4 },
  exName: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
  meta: { fontSize: 14, color: '#111827' },
  metaMuted: { fontSize: 14, color: '#6B7280' },
  comment: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#333333', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#666666', textAlign: 'center' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 64, height: 64, borderRadius: 32, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', elevation: 8 },
  fabText: { fontSize: 32, color: '#FFFFFF', fontWeight: '300' },
});