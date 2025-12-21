import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchExercises, fetchExerciseCategories, addExercise } from '../store/exercisesSlice';
import ExerciseCard from '../components/exercises/ExerciseCard';
import ExerciseModal from '../components/exercises/ExerciseModal';
import CategoryDropdown from '../components/exercises/CategoryDropdown';
import SearchBar from '../components/exercises/SearchBar';

export default function ExercisesScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { items: exercises, categories, status, error } = useSelector((state) => state.exercises);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState(null);
  const [showCreateCategoryDropdown, setShowCreateCategoryDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchExercises());
    dispatch(fetchExerciseCategories());
  }, [dispatch]);

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
  };

  const handleOpenCreateModal = () => {
    setNewExerciseName('');
    setNewExerciseDescription('');
    setNewExerciseCategory(null);
    setCreateModalVisible(true);
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
    setNewExerciseName('');
    setNewExerciseDescription('');
    setNewExerciseCategory(null);
  };

  const handleCreateExercise = async () => {
    if (!newExerciseName.trim()) {
      Alert.alert('Erro', 'O nome do exercício é obrigatório!');
      return;
    }

    if (!newExerciseCategory && newExerciseCategory !== 0) {
      Alert.alert('Erro', 'Selecione uma categoria!');
      return;
    }

    try {
      const exerciseData = {
        name: newExerciseName.trim(),
        categoryId: newExerciseCategory,
        description: newExerciseDescription.trim(),
      };
      
      const result = await dispatch(addExercise(exerciseData));

      if (addExercise.fulfilled.match(result)) {
        Alert.alert('Sucesso', 'Exercício criado com sucesso!');
        handleCloseCreateModal();
        // O exercício já é adicionado automaticamente ao state pelo reducer
        // Não precisamos fazer fetchExercises() que substituiria a lista
      } else {
        // Extrair mensagem de erro corretamente
        let errorMessage = 'Erro ao criar exercício';
        if (result.payload) {
          if (typeof result.payload === 'string') {
            errorMessage = result.payload;
          } else if (result.payload.detail) {
            errorMessage = result.payload.detail;
          } else if (result.payload.message) {
            errorMessage = result.payload.message;
          } else if (result.payload.error) {
            errorMessage = result.payload.error;
          } else {
            errorMessage = JSON.stringify(result.payload);
          }
        }
        Alert.alert('Erro', errorMessage);
      }
    } catch (err) {
      Alert.alert('Erro', 'Erro ao criar exercício');
    }
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
      <Modal
        visible={createModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseCreateModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={handleCloseCreateModal}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar Exercício</Text>
              <TouchableOpacity onPress={handleCloseCreateModal} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>NOME DO EXERCÍCIO *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: Supino Inclinado"
                value={newExerciseName}
                onChangeText={setNewExerciseName}
                placeholderTextColor="#999"
              />

              <Text style={styles.modalLabel}>DESCRIÇÃO (OPCIONAL)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Descreva o exercício..."
                value={newExerciseDescription}
                onChangeText={setNewExerciseDescription}
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <Text style={styles.modalLabel}>CATEGORIA *</Text>
              <TouchableOpacity
                style={styles.modalCategorySelector}
                onPress={() => setShowCreateCategoryDropdown(!showCreateCategoryDropdown)}
              >
                <Text style={[
                  styles.categorySelectorText,
                  !newExerciseCategory && styles.categorySelectorPlaceholder
                ]}>
                  {newExerciseCategory
                    ? categories.find(cat => cat.id === newExerciseCategory)?.name_pt || 
                      categories.find(cat => cat.id === newExerciseCategory)?.name ||
                      'Selecione uma categoria'
                    : 'Selecione uma categoria'}
                </Text>
                <Text style={styles.modalDropdownArrow}>▼</Text>
              </TouchableOpacity>

              {/* Dropdown de Categorias no Modal */}
              {showCreateCategoryDropdown && (
                <View style={styles.modalCategoryDropdown}>
                  <FlatList
                    data={categories}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.modalCategoryOption}
                        onPress={() => {
                          // Garantir que o ID é um número
                          const categoryId = typeof item.id === 'number' ? item.id : parseInt(item.id, 10);
                          setNewExerciseCategory(categoryId);
                          setShowCreateCategoryDropdown(false);
                        }}
                      >
                        <Text style={styles.modalCategoryText}>
                          {item.name_pt || item.name}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}

              <TouchableOpacity style={styles.modalButton} onPress={handleCreateExercise}>
                <Text style={styles.modalButtonText}>Criar Exercício</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.2,
  },
  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 20,
    color: '#8E8E93',
    fontWeight: '500',
  },
  modalBody: {
    padding: 22,
    paddingBottom: 34,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  modalInput: {
    backgroundColor: '#F2F2F7',
    borderWidth: 0,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  modalTextArea: {
    height: 100,
    paddingTop: 16,
  },
  modalCategorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 24,
  },
  categorySelectorText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 1,
  },
  categorySelectorPlaceholder: {
    color: '#999',
  },
  modalDropdownArrow: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 8,
  },
  modalCategoryDropdown: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    maxHeight: 200,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  modalCategoryOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalCategoryText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});

