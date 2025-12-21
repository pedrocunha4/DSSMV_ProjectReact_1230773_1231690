import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert, Modal
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDays, addDay, clearDays } from '../store/daysSlice';
import { useNavigation, useRoute } from '@react-navigation/native';

const DAYS_OF_WEEK = [
  { name: 'Segunda', value: 1 },
  { name: 'Terça', value: 2 },
  { name: 'Quarta', value: 3 },
  { name: 'Quinta', value: 4 },
  { name: 'Sexta', value: 5 },
  { name: 'Sábado', value: 6 },
  { name: 'Domingo', value: 7 },
];

export default function PlanDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { planId, planName } = route.params;

  const dispatch = useDispatch();
  const { items: allDays, status } = useSelector((state) => state.days);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDayDescription, setNewDayDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    dispatch(fetchDays(planId));

    return () => {
      dispatch(clearDays());
    };
  }, [dispatch, planId]);

  const filteredDays = useMemo(() => {
    return allDays.filter(day => {
      const routineId = day.routine || day.training;
      return routineId === planId;
    });
  }, [allDays, planId]);

  const toggleDay = (dayValue) => {
    setSelectedDays((prev) =>
      prev.includes(dayValue) ? prev.filter((d) => d !== dayValue) : [...prev, dayValue]
    );
  };

  const handleOpenModal = () => {
    setSelectedDays([]);
    setNewDayDescription('');
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedDays([]);
    setNewDayDescription('');
  };

  const handleAddDay = async () => {
    if (selectedDays.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um dia da semana!');
      return;
    }

    // Criar um dia separado para cada dia da semana selecionado
    for (const dayValue of selectedDays) {
      const dayName = DAYS_OF_WEEK.find(day => day.value === dayValue)?.name;
      const description = newDayDescription.trim() 
        ? `${newDayDescription} - ${dayName}` 
        : dayName;

      await dispatch(addDay({ 
        planId, 
        description, 
        selectedDays: [dayValue] // Apenas um dia por vez
      }));
    }
    
    handleCloseModal();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DayDetails', { dayId: item.id, dayName: item.description })}
      activeOpacity={0.7}
    >
      <View style={styles.cardLeft}>
        <View style={styles.cardIndicator} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>
        {item.description && item.description.trim() !== "" ? item.description : "Dia Sem Nome"}
      </Text>
          <Text style={styles.cardSubtitle}>Toca para adicionar exercícios</Text>
        </View>
      </View>
      <View style={styles.cardArrow}>
      <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header Azul */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{planName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Lista de Dias Criados */}
      {status === 'loading' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={filteredDays}
          renderItem={renderItem}
          keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <View style={styles.emptyIconCircle} />
              </View>
              <Text style={styles.emptyText}>Nenhum dia de treino criado</Text>
              <Text style={styles.emptySubtext}>Toca no botão + para começar</Text>
            </View>
          }
        />
      )}

      {/* Botão Flutuante para Criar Dia */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleOpenModal}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal de Criação de Dia */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar Dia de Treino</Text>
              <TouchableOpacity onPress={handleCloseModal} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>DESCRIÇÃO (OPCIONAL)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ex: Peito e Tríceps"
                value={newDayDescription}
                onChangeText={setNewDayDescription}
                placeholderTextColor="#999"
              />

              <Text style={styles.modalLabel}>SELECIONA OS DIAS DA SEMANA</Text>
              <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map((day, index) => (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.dayOption,
                      selectedDays.includes(day.value) && styles.dayOptionSelected,
                      index === DAYS_OF_WEEK.length - 1 && styles.dayOptionLast,
                    ]}
                    onPress={() => toggleDay(day.value)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.checkbox,
                      selectedDays.includes(day.value) && styles.checkboxSelected,
                    ]}>
                      {selectedDays.includes(day.value) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.dayText,
                        selectedDays.includes(day.value) && styles.dayTextSelected,
                      ]}
                    >
                      {day.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.modalButton} onPress={handleAddDay}>
                <Text style={styles.modalButtonText}>Criar Dia</Text>
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 18,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  backButton: {
    padding: 8,
    marginRight: 4,
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  headerSpacer: {
    width: 42,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 0,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIndicator: {
    width: 4,
    height: 60,
    backgroundColor: '#007AFF',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
    paddingVertical: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '400',
  },
  cardArrow: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  arrow: {
    fontSize: 24,
    color: '#C7C7CC',
    fontWeight: '400',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F0F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#D1D1D6',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
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
  daysContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  dayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  dayOptionSelected: {
    backgroundColor: '#E8F4FD',
  },
  dayOptionLast: {
    borderBottomWidth: 0,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  dayText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  dayTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
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