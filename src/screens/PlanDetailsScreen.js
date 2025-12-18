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

    const description = newDayDescription.trim() || 
      selectedDays.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.name).join(', ');

    await dispatch(addDay({ planId, description, selectedDays }));
    handleCloseModal();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DayDetails', { dayId: item.id, dayName: item.description })}
    >
      <Text style={styles.cardText}>
        {item.description && item.description.trim() !== "" ? item.description : "Dia Sem Nome"}
      </Text>
      <Text style={styles.arrow}>›</Text>
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
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>Nenhum dia de treino criado</Text>
              <Text style={styles.emptySubtext}>Toca no botão abaixo para criar!</Text>
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
    paddingBottom: 100,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  arrow: {
    fontSize: 28,
    color: '#007AFF',
    fontWeight: '300',
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#666666',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
    paddingBottom: 30,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 10,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modalInput: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
  },
  daysContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 6,
    marginBottom: 20,
  },
  dayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    marginBottom: 4,
  },
  dayOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  dayOptionLast: {
    marginBottom: 0,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});