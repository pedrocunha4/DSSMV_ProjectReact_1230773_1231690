import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchExercises, fetchExerciseCategories } from '../store/exercisesSlice';
import ExerciseCard from '../components/exercises/ExerciseCard';
import ExerciseModal from '../components/exercises/ExerciseModal';
import CategoryDropdown from '../components/exercises/CategoryDropdown';
import SearchBar from '../components/exercises/SearchBar';
import CreateExerciseModal from '../components/exercises/CreateExerciseModal';

export default function ExercisesScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { items: exercises, categories, status, error } = useSelector((state) => state.exercises);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState(null);

  useEffect(() => {
    dispatch(fetchExercises());
    dispatch(fetchExerciseCategories());
  }, [dispatch]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
  };

  const handleOpenCreateModal = () => {
    setCreateModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
  };

  const handleEditExercise = (exercise) => {
    setExerciseToEdit(exercise);
    setSelectedExercise(null); // Fechar modal de detalhes
    setEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setExerciseToEdit(null);
  };


  const filteredExercises = (exercises || []).filter((exercise) => {
    if (!exercise || !exercise.name) return false;
    const searchTerm = (search || '').toLowerCase();
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === null || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedCategoryName = selectedCategory
    ? categories.find((cat) => cat.id === selectedCategory)?.name_pt ||
      categories.find((cat) => cat.id === selectedCategory)?.name ||
      'Todas as categorias'
    : 'Todas as categorias';

  const renderExercise = ({ item }) => (
    <ExerciseCard
      exercise={item}
      onPress={() => setSelectedExercise(item)}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exercícios</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Barra de Pesquisa */}
      <SearchBar value={search} onChangeText={setSearch} />

      {/* Filtro de Categorias */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.categorySelector}
          onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
        >
          <Text style={styles.categoryText}>{selectedCategoryName}</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
          <Text style={styles.clearButtonText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown de Categorias */}
      <CategoryDropdown
        visible={showCategoryDropdown}
        categories={categories}
        onSelectCategory={setSelectedCategory}
        onClose={() => setShowCategoryDropdown(false)}
      />

      {/* Lista de Exercícios */}
      {status === 'loading' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : status === 'failed' ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro ao carregar exercícios</Text>
          <Text style={styles.errorDetail}>{error || 'Erro desconhecido'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              dispatch(fetchExercises());
              dispatch(fetchExerciseCategories());
            }}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredExercises}
          renderItem={renderExercise}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {search || selectedCategory
                ? 'Nenhum exercício encontrado com estes filtros.'
                : 'Nenhum exercício disponível.'}
            </Text>
          }
        />
      )}

      {/* Modal de Detalhes do Exercício */}
      <ExerciseModal
        exercise={selectedExercise}
        visible={selectedExercise !== null}
        onClose={() => setSelectedExercise(null)}
        onEdit={() => handleEditExercise(selectedExercise)}
      />

      {/* Botão Flutuante para Criar Exercício */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleOpenCreateModal}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal de Criação de Exercício */}
      <CreateExerciseModal
        visible={createModalVisible}
        categories={categories}
        onClose={handleCloseCreateModal}
      />

      {/* Modal de Edição de Exercício */}
      <CreateExerciseModal
        visible={editModalVisible}
        categories={categories}
        exercise={exerciseToEdit}
        onClose={handleCloseEditModal}
      />
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryText: {
    fontSize: 14,
    color: '#333333',
    marginRight: 8,
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666666',
  },
  clearButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    marginTop: 40,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '400',
    marginTop: -1,
  },
});

