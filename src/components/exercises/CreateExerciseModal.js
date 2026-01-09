import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addExercise, updateExercise } from '../../store/exercisesSlice';

export default function CreateExerciseModal({ visible, categories, onClose, exercise }) {
  const dispatch = useDispatch();
  const isEditing = !!exercise;
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState(null);
  const [showCreateCategoryDropdown, setShowCreateCategoryDropdown] = useState(false);

  useEffect(() => {
    if (exercise && visible) {
      setNewExerciseName(exercise.name || '');
      setNewExerciseDescription(exercise.description || '');
      setNewExerciseCategory(exercise.category || null);
    } else if (!visible) {
      setNewExerciseName('');
      setNewExerciseDescription('');
      setNewExerciseCategory(null);
      setShowCreateCategoryDropdown(false);
    }
  }, [exercise, visible]);

  const handleClose = () => {
    setNewExerciseName('');
    setNewExerciseDescription('');
    setNewExerciseCategory(null);
    setShowCreateCategoryDropdown(false);
    onClose();
  };

  const handleSaveExercise = async () => {
    if (!newExerciseName.trim()) {
      Alert.alert('Erro', 'O nome do exercício é obrigatório!');
      return;
    }

    if (!newExerciseCategory && newExerciseCategory !== 0) {
      Alert.alert('Erro', 'Selecione uma categoria!');
      return;
    }

    try {
      if (isEditing) {
        const exerciseData = {
          exerciseId: exercise.id,
          name: newExerciseName.trim(),
          categoryId: newExerciseCategory,
          description: newExerciseDescription.trim(),
        };

        const result = await dispatch(updateExercise(exerciseData));

        if (updateExercise.fulfilled.match(result)) {
          Alert.alert('Sucesso', 'Exercício atualizado com sucesso!');
          handleClose();
        } else {
          let errorMessage = 'Erro ao atualizar exercício';
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
      } else {
        const exerciseData = {
          name: newExerciseName.trim(),
          categoryId: newExerciseCategory,
          description: newExerciseDescription.trim(),
        };

        const result = await dispatch(addExercise(exerciseData));

        if (addExercise.fulfilled.match(result)) {
          Alert.alert('Sucesso', 'Exercício criado com sucesso!');
          handleClose();
        } else {
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
      }
    } catch (err) {
      Alert.alert('Erro', isEditing ? 'Erro ao atualizar exercício' : 'Erro ao criar exercício');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalOverlayTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isEditing ? 'Editar Exercício' : 'Criar Exercício'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.modalCloseButton}>
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

            <TouchableOpacity style={styles.modalButton} onPress={handleSaveExercise}>
              <Text style={styles.modalButtonText}>
                {isEditing ? 'Salvar Alterações' : 'Criar Exercício'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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



