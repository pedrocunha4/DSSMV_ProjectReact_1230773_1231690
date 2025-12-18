import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, Modal, TextInput, ScrollView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlans, deletePlan, updatePlan } from '../store/plansSlice';
import { useNavigation } from '@react-navigation/native';

export default function PlansScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { items, status } = useSelector((state) => state.plans);

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState(''); // Vai guardar "Ganhar massa..." ou "Perder peso"
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const handleDelete = (id) => {
    Alert.alert(
      "Apagar Plano",
      "Tem a certeza?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: () => dispatch(deletePlan(id)) }
      ]
    );
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setEditName(plan.name || '');
    // Se a descrição atual não for uma das opções, pomos vazio ou mantemos
    setEditDesc(plan.description || '');

    setEditStart(plan.start || plan.start_date || '');
    setEditEnd(plan.end || plan.end_date || '');

    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
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
      id: editingPlan.id,
      name: editName,
      description: editDesc,
      start: editStart,
      end: editEnd
    }));

    setEditModalVisible(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-PT');
    } catch { return dateString; }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => navigation.navigate('PlanDetails', { planId: item.id, planName: item.name })}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.planIcon}>
            <Text style={styles.planIconText}>📋</Text>
          </View>
          <View style={styles.planInfo}>
            <Text style={styles.planName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.planDesc} numberOfLines={1}>Objetivo: {item.description ? item.description.replace('Objetivo: ', '') : 'Sem objetivo'}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.planDate}>
            {formatDate(item.start || item.start_date)} - {formatDate(item.end || item.end_date)}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionButton, styles.editBtn]} onPress={() => openEditModal(item)}>
              <Text style={styles.actionText}>✎</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.deleteBtn]} onPress={() => handleDelete(item.id)}>
              <Text style={styles.actionText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Planos</Text>
        <View style={{width: 30}} />
      </View>

      {status === 'loading' ? (
        <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Sem planos.</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('PlanCreate')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* MODAL DE EDIÇÃO */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent>
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
                <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelBtn}>
                  <Text style={{color: '#666'}}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveEdit} style={styles.saveBtn}>
                  <Text style={{color: '#fff', fontWeight: 'bold'}}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  backIcon: { color: '#FFF', fontSize: 24 },
  listContent: { padding: 15, paddingBottom: 100 },

  card: { backgroundColor: '#FFF', borderRadius: 12, marginBottom: 15, elevation: 3 },
  cardContent: { padding: 15 },
  cardHeader: { flexDirection: 'row', marginBottom: 10 },
  planIcon: { backgroundColor: '#E3F2FD', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  planIconText: { fontSize: 20 },
  planInfo: { flex: 1, justifyContent: 'center' },
  planName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  planDesc: { fontSize: 13, color: '#666' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EEE', paddingTop: 10 },
  planDate: { fontSize: 12, color: '#999' },

  actions: { flexDirection: 'row' },
  actionButton: { padding: 8, borderRadius: 8, marginLeft: 10 },
  editBtn: { backgroundColor: '#FFF3E0' },
  deleteBtn: { backgroundColor: '#FFEBEE' },
  actionText: { fontSize: 16 },

  fab: { position: 'absolute', bottom: 25, right: 25, backgroundColor: '#007AFF', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  fabText: { color: '#FFF', fontSize: 30, marginTop: -3 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 15, padding: 20, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 10 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, backgroundColor: '#FAFAFA' },

  objectiveContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
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
  objectiveText: { color: '#666' },
  objectiveTextSelected: { color: '#007AFF', fontWeight: 'bold' },

  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  cancelBtn: { padding: 10, marginRight: 10 },
  saveBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8 }
});