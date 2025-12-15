import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// Por agora vamos usar uma lista mock; depois ligamos à API Wger
const MOCK_EXERCISES = [
  { id: 1, name: 'Bench Press', category: 'Peito' },
  { id: 2, name: 'Squat', category: 'Pernas' },
  { id: 3, name: 'Deadlift', category: 'Costas' },
  { id: 4, name: 'Bicep Curl', category: 'Braços' },
];

const CATEGORIES = ['Todos', 'Peito', 'Pernas', 'Costas', 'Braços'];

export default function ExercisesScreen() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('Todos');

  const filtered = MOCK_EXERCISES.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      category === 'Todos' ? true : ex.category === category;
    return matchesSearch && matchesCategory;
  });

  const handleClearFilters = () => {
    setSearch('');
    setCategory('Todos');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercícios</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar por nome..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filtersRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                category === cat && styles.chipSelected,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  category === cat && styles.chipTextSelected,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearFilters}
        >
          <Text style={styles.clearButtonText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.list}>
        {filtered.map((ex) => (
          <View key={ex.id} style={styles.card}>
            <Text style={styles.cardTitle}>{ex.name}</Text>
            <Text style={styles.cardSubtitle}>{ex.category}</Text>
          </View>
        ))}

        {filtered.length === 0 && (
          <Text style={styles.emptyText}>
            Nenhum exercício encontrado com estes filtros.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#007AFF',
  },
  chipText: {
    color: '#333',
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#FFF',
  },
  clearButton: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  clearButtonText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    fontSize: 13,
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 40,
  },
});


