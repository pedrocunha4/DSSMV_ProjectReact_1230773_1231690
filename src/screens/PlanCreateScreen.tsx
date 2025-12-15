import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addPlan, resetCreateStatus } from '../store/plansSlice';
import { AppDispatch, RootState } from '../store/store';
import { useNavigation } from '@react-navigation/native';
import PlanNameInput from '../components/plans/PlanNameInput';
import GoalSelector from '../components/plans/GoalSelector';
import DaysSelector from '../components/plans/DaysSelector';
import CreatePlanButton from '../components/plans/CreatePlanButton';

type GoalType = 'Ganhar massa muscular' | 'Perder peso';

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

  const isFormValid = name.trim() !== '' && goal !== null && selectedDays.length > 0;
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
        <DaysSelector selectedDays={selectedDays} onToggleDay={toggleDay} />
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
});
