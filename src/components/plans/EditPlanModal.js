import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { updatePlan } from '../../store/plansSlice';

export default function EditPlanModal({
  visible,
  plan,
  onClose,
}) {
  const dispatch = useDispatch();
  const [editName, setEditName] = React.useState('');
  const [editDesc, setEditDesc] = React.useState('');
  const [editStart, setEditStart] = React.useState('');
  const [editEnd, setEditEnd] = React.useState('');

  // Preencher campos quando o plano mudar
  React.useEffect(() => {
    if (plan && visible) {
      setEditName(plan.name || '');
      setEditDesc(plan.description || '');
      setEditStart(plan.start || plan.start_date || '');
      setEditEnd(plan.end || plan.end_date || '');
    } else if (!visible) {
      // Limpar campos quando fechar
      setEditName('');
      setEditDesc('');
      setEditStart('');
      setEditEnd('');
    }
  }, [plan, visible]);

  const handleSave = async () => {
    if (!editName.trim()) {
      Alert.alert("Erro", "O nome é obrigatório.");
      return;
    }
    if (!editDesc) {
      Alert.alert("Erro", "Selecione um objetivo (Ganhar massa ou Perder peso).");
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(editStart) || !dateRegex.test(editEnd)) {
      Alert.alert("Erro", "As datas devem estar no formato AAAA-MM-DD (ex: 2025-01-30).");
      return;
    }

    await dispatch(updatePlan({
      id: plan.id,
      name: editName,
      description: editDesc,
      start: editStart,
      end: editEnd
    }));

    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView>
            <Text style={styles.modalTitle}>Editar Plano</Text>

            <Text style={styles.label}>Nome do Plano:</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
            />

            <Text style={styles.label}>Objetivo:</Text>
            <View style={styles.objectiveContainer}>
              <TouchableOpacity
                style={[styles.objectiveBtn, editDesc === 'Ganhar massa muscular' && styles.objectiveBtnSelected]}
                onPress={() => setEditDesc('Ganhar massa muscular')}
              >
                <Text style={[styles.objectiveText, editDesc === 'Ganhar massa muscular' && styles.objectiveTextSelected]}>
                  💪 Ganhar Massa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.objectiveBtn, editDesc === 'Perder peso' && styles.objectiveBtnSelected]}
                onPress={() => setEditDesc('Perder peso')}
              >
                <Text style={[styles.objectiveText, editDesc === 'Perder peso' && styles.objectiveTextSelected]}>
                  🏃 Perder Peso
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Data Início (AAAA-MM-DD):</Text>
            <TextInput
              style={styles.input}
              value={editStart}
              onChangeText={setEditStart}
              placeholder="2025-01-01"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Data Fim (AAAA-MM-DD):</Text>
            <TextInput
              style={styles.input}
              value={editEnd}
              onChangeText={setEditEnd}
              placeholder="2025-06-01"
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                <Text style={{color: '#666'}}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    padding: 20 
  },
  modalContent: { 
    backgroundColor: '#FFF', 
    borderRadius: 15, 
    padding: 20, 
    maxHeight: '90%' 
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    textAlign: 'center' 
  },
  label: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 5, 
    marginTop: 10 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#DDD', 
    borderRadius: 8, 
    padding: 12, 
    backgroundColor: '#FAFAFA' 
  },
  objectiveContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 5 
  },
  objectiveBtn: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#FAFAFA'
  },
  objectiveBtnSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#007AFF',
    borderWidth: 2
  },
  objectiveText: { 
    color: '#666' 
  },
  objectiveTextSelected: { 
    color: '#007AFF', 
    fontWeight: 'bold' 
  },
  modalButtons: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 20 
  },
  cancelBtn: { 
    padding: 10, 
    marginRight: 10 
  },
  saveBtn: { 
    backgroundColor: '#007AFF', 
    padding: 10, 
    borderRadius: 8 
  }
});

