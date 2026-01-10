import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExercises } from '../store/exercisesSlice';
import { addSet } from '../store/setsSlice';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getCategoryColor } from '../utils/exerciseUtils';

export default function ExerciseSelectScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { dayId } = route.params;

  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.exercises);
  const { items: sets } = useSelector((state) => state.sets);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchExercises());
    }
  }, [dispatch, status]);

  const handleSelect = async (exercise) => {
    setAdding(true);
    try {
      const nextOrder = sets.length + 1;

      const result = await dispatch(addSet({
        dayId,
        exerciseId: exercise.id,
        sets: 0,
        reps: 0,
        order: nextOrder
      }));

      if (addSet.fulfilled.match(result)) {
        Alert.alert("Sucesso", `${exercise.name} adicionado!`);
        navigation.goBack();
      } else {
        Alert.alert("Erro", "Falha ao adicionar exercício");
      }
    } catch (err) {
      Alert.alert("Erro", "Erro ao adicionar exercício");
    } finally {
      setAdding(false);
    }
  };

  const renderItem = ({ item }) => {
    if (!item || !item.name) return null;

    const categoryColor = getCategoryColor(item.category_name);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelect(item)}
        activeOpacity={0.8}
        disabled={adding}
      >
        <View style={styles.cardContent}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '20' }]}>
            <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {item.category_name || 'Sem categoria'}
            </Text>
          </View>
          <Text style={styles.exerciseName}>{item.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escolher Exercício</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Lista de Exercícios */}
      {status === 'loading' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}

      {adding && (
        <View style={styles.addingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.addingText}>Adicionando exercício...</Text>
        </View>
      )}
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
  cardContent: {
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 10,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  addingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },
});
