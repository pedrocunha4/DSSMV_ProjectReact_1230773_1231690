import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExercises } from '../store/exercisesSlice';
import { addSet } from '../store/setsSlice';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ExerciseSelectScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { dayId } = route.params;

  const dispatch = useDispatch();
  const { items, status } = useSelector((state) => state.exercises);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchExercises());
  }, [dispatch, status]);

  const handleSelect = async (exerciseId) => {
    await dispatch(addSet({ dayId, exerciseId, sets: 3, reps: 10 }));
    Alert.alert("Sucesso", "Exercício adicionado!");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Escolha um Exercício</Text>
      {status === 'loading' ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => handleSelect(item.id)}>
              <Text style={styles.name}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  card: { backgroundColor: '#fff', padding: 15, marginBottom: 10, borderRadius: 8 },
  name: { fontSize: 16 }
});