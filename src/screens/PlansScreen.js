import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlans, deletePlan } from '../store/plansSlice';
import { useNavigation } from '@react-navigation/native';
import { isPlanActiveToday } from '../utils/planUtils';
import EditPlanModal from '../components/plans/EditPlanModal';
import PlanCard from '../components/plans/PlanCard';

export default function PlansScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { items, status } = useSelector((state) => state.plans);

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showOnlyActive, setShowOnlyActive] = useState(false);

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
    setEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setEditingPlan(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('pt-PT');
    } catch { return dateString; }
  };

  // Filtrar planos baseado no filtro de ativos
  const filteredPlans = useMemo(() => {
    if (!showOnlyActive) return items;
    return items.filter(plan => isPlanActiveToday(plan));
  }, [items, showOnlyActive]);

  const renderItem = ({ item }) => (
    <PlanCard
      plan={item}
      onPress={() => navigation.navigate('PlanDetails', { planId: item.id, planName: item.name })}
      onEdit={() => openEditModal(item)}
      onDelete={() => handleDelete(item.id)}
      formatDate={formatDate}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Planos</Text>
        <TouchableOpacity 
          onPress={() => setShowOnlyActive(!showOnlyActive)}
          style={[styles.filterButton, showOnlyActive && styles.filterButtonActive]}
        >
          <Text style={[styles.filterButtonText, showOnlyActive && styles.filterButtonTextActive]}>
            {showOnlyActive ? '✓ Ativos' : 'Todos'}
          </Text>
        </TouchableOpacity>
      </View>

      {status === 'loading' ? (
        <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={filteredPlans}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {showOnlyActive ? 'Nenhum plano ativo hoje.' : 'Sem planos.'}
            </Text>
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('PlanCreate')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Modal de Edição */}
      <EditPlanModal
        visible={isEditModalVisible}
        plan={editingPlan}
        onClose={handleCloseEditModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#007AFF', padding: 20, paddingTop: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  backIcon: { color: '#FFF', fontSize: 24 },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#007AFF',
  },
  listContent: { padding: 15, paddingBottom: 100 },
  fab: { position: 'absolute', bottom: 25, right: 25, backgroundColor: '#007AFF', width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 5 },
  fabText: { color: '#FFF', fontSize: 30, marginTop: -3 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
});
