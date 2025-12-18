import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addPlan, resetCreateStatus } from '../store/plansSlice';
import { useNavigation } from '@react-navigation/native';
import PlanNameInput from '../components/plans/PlanNameInput';
import GoalSelector from '../components/plans/GoalSelector';
import CreatePlanButton from '../components/plans/CreatePlanButton';

export default function PlanCreateScreen() {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(null);
  
  // Datas padrão: hoje até 6 meses no futuro
  const getDefaultDates = () => {
    const today = new Date();
    const future = new Date(today);
    future.setMonth(future.getMonth() + 6);
    
    return {
      start: today.toISOString().split('T')[0],
      end: future.toISOString().split('T')[0]
    };
  };
  
  const defaultDates = getDefaultDates();
  const [startDate, setStartDate] = useState(defaultDates.start);
  const [endDate, setEndDate] = useState(defaultDates.end);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { createStatus } = useSelector((state) => state.plans);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome do plano é obrigatório!');
      return;
    }

    if (!goal) {
      Alert.alert('Erro', 'Por favor, selecione um objetivo!');
      return;
    }

    // Validar datas
    if (!startDate || !endDate) {
      Alert.alert('Erro', 'As datas são obrigatórias!');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      Alert.alert('Erro', 'A data de início deve ser anterior à data de fim!');
      return;
    }

    const description = goal;

    const result = await dispatch(addPlan({ 
      name: name.trim(), 
      description,
      start: startDate,
      end: endDate
    }));

    if (addPlan.fulfilled.match(result)) {
      Alert.alert('Sucesso', 'Plano criado com sucesso!');
      dispatch(resetCreateStatus());
      navigation.goBack();
    } else {
      Alert.alert('Erro', 'Falha ao criar plano.');
    }
  };

  const isFormValid = name.trim() !== '' && goal !== null && startDate && endDate;
  const isDisabled = createStatus === 'loading' || !isFormValid;

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
        <PlanNameInput value={name} onChangeText={setName} />
        <GoalSelector selectedGoal={goal} onSelectGoal={setGoal} />
        
        {/* Datas */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>DURAÇÃO DO PLANO</Text>
          
          <View style={styles.dateRow}>
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>Data Início</Text>
              <TextInput
                style={styles.dateInput}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>
            
            <View style={styles.dateColumn}>
              <Text style={styles.dateLabel}>Data Fim</Text>
              <TextInput
                style={styles.dateInput}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        </View>
      </ScrollView>

      <CreatePlanButton
        onPress={handleSave}
        disabled={isDisabled}
        loading={createStatus === 'loading'}
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
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateColumn: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
});

