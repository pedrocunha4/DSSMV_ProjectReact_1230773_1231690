import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { addDay } from '../../store/daysSlice';

const DAYS_OF_WEEK = [
  { name: 'Segunda', value: 1 },
  { name: 'Terça', value: 2 },
  { name: 'Quarta', value: 3 },
  { name: 'Quinta', value: 4 },
  { name: 'Sexta', value: 5 },
  { name: 'Sábado', value: 6 },
  { name: 'Domingo', value: 7 },
];

export default function CreateDayModal({ visible, planId, onClose }) {
  const dispatch = useDispatch();
  const [newDayDescription, setNewDayDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);

  const handleClose = () => {
    setSelectedDays([]);
    setNewDayDescription('');
    onClose();
  };

  const toggleDay = (dayValue) => {
    setSelectedDays((prev) =>
      prev.includes(dayValue) ? prev.filter((d) => d !== dayValue) : [...prev, dayValue]
    );
  };

  const handleAddDay = async () => {
    if (selectedDays.length === 0) {
      Alert.alert('Erro', 'Selecione pelo menos um dia da semana!');
      return;
    }

    for (const dayValue of selectedDays) {
      const dayName = DAYS_OF_WEEK.find(day => day.value === dayValue)?.name;
      const description = newDayDescription.trim() 
        ? `${newDayDescription} - ${dayName}` 
        : dayName;

      const result = await dispatch(addDay({ 
        planId, 
        description, 
        selectedDays: [dayValue]
      }));
      
      if (addDay.rejected.match(result)) {
        Alert.alert('Erro', 'Falha ao criar dia de treino');
        return;
      }
    }
    
    handleClose();
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
            <Text style={styles.modalTitle}>Criar Dia de Treino</Text>
            <TouchableOpacity onPress={handleClose} style={styles.modalCloseButton}>
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



