import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addPlan, resetCreateStatus } from '../store/plansSlice';
import { AppDispatch, RootState } from '../store/store';
import { useNavigation } from '@react-navigation/native';

type GoalType = 'Ganhar massa muscular' | 'Perder peso';

const DAYS_OF_WEEK = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

export default function PlanCreateScreen() {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState<GoalType | null>(null);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { createStatus } = useSelector((state: RootState) => state.plans);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome do plano é obrigatório!');
      return;
    }

    if (!goal) {
      Alert.alert('Erro', 'Por favor, selecione um objetivo!');
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert('Erro', 'Por favor, selecione pelo menos um dia!');
      return;
    }

    const description = `Goal: ${goal}\nDias: ${selectedDays.join(', ')}`;

    const result = await dispatch(addPlan({ name: name.trim(), description }));

    if (addPlan.fulfilled.match(result)) {
      Alert.alert('Sucesso', 'Plano criado com sucesso!');
      dispatch(resetCreateStatus());
      navigation.goBack();
    } else {
      Alert.alert('Erro', 'Falha ao criar plano.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Azul */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Novo Plano</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Campo Nome do Plano */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Nome do Plano</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.nameInput}
              placeholder="Ex: Peito, Costas, Pernas..."
              value={name}
              onChangeText={setName}
              placeholderTextColor="#999"
            />
            <View style={styles.inputUnderline} />
          </View>
        </View>

        {/* Seleção de Objetivo */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Objetivo</Text>
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={[
                styles.radioOption,
                goal === 'Ganhar massa muscular' && styles.radioOptionSelected,
              ]}
              onPress={() => setGoal('Ganhar massa muscular')}
              activeOpacity={0.7}
            >
              <View style={[
                styles.radioCircle,
                goal === 'Ganhar massa muscular' && styles.radioCircleSelected,
              ]}>
                {goal === 'Ganhar massa muscular' && <View style={styles.radioSelected} />}
              </View>
              <View style={styles.radioContent}>
                <Text style={[
                  styles.radioText,
                  goal === 'Ganhar massa muscular' && styles.radioTextSelected,
                ]}>
                  💪 Ganhar massa muscular
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.radioOption,
                goal === 'Perder peso' && styles.radioOptionSelected,
              ]}
              onPress={() => setGoal('Perder peso')}
              activeOpacity={0.7}
            >
              <View style={[
                styles.radioCircle,
                goal === 'Perder peso' && styles.radioCircleSelected,
              ]}>
                {goal === 'Perder peso' && <View style={styles.radioSelected} />}
              </View>
              <View style={styles.radioContent}>
                <Text style={[
                  styles.radioText,
                  goal === 'Perder peso' && styles.radioTextSelected,
                ]}>
                  🔥 Perder peso
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seleção de Dias */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Seleciona os dias</Text>
          <View style={styles.daysContainer}>
            {DAYS_OF_WEEK.map((day, index) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayOption,
                  selectedDays.includes(day) && styles.dayOptionSelected,
                  index === DAYS_OF_WEEK.length - 1 && styles.dayOptionLast,
                ]}
                onPress={() => toggleDay(day)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.checkbox,
                  selectedDays.includes(day) && styles.checkboxSelected,
                ]}>
                  {selectedDays.includes(day) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.dayText,
                    selectedDays.includes(day) && styles.dayTextSelected,
                  ]}
                >
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Botão Criar Plano */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.createButton,
            createStatus === 'loading' && styles.createButtonDisabled,
            (!name.trim() || !goal || selectedDays.length === 0) && styles.createButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={createStatus === 'loading' || !name.trim() || !goal || selectedDays.length === 0}
          activeOpacity={0.8}
        >
          {createStatus === 'loading' ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.createButtonText}>Criar plano</Text>
          )}
        </TouchableOpacity>
      </View>
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
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
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
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 36,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 14,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  nameInput: {
    paddingVertical: 16,
    fontSize: 18,
    color: '#1A1A1A',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  inputUnderline: {
    height: 3,
    backgroundColor: '#FF8C00',
    borderRadius: 2,
    marginTop: -2,
  },
  radioContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 6,
  },
  radioOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  radioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2.5,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#FFFFFF',
  },
  radioCircleSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  radioSelected: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#007AFF',
  },
  radioContent: {
    flex: 1,
  },
  radioText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  radioTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  daysContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  dayOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 4,
  },
  dayOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  dayOptionLast: {
    marginBottom: 0,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2.5,
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
    fontSize: 18,
    fontWeight: 'bold',
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
  buttonContainer: {
    padding: 20,
    paddingBottom: 28,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  createButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
