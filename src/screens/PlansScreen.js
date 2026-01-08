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
import api from '../services/api';

export default function PlansScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { items, status } = useSelector((state) => state.plans);

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [filterByDate, setFilterByDate] = useState(false);
  const [filterByWeekday, setFilterByWeekday] = useState(false);
  const [activeByWeekdayPlanIds, setActiveByWeekdayPlanIds] = useState(new Set());
  const [daysLoading, setDaysLoading] = useState(false);

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

  // Fetch routines that have today's weekday when filterByWeekday is toggled or plans change
  useEffect(() => {
    const fetchDaysForWeekday = async () => {
      if (!filterByWeekday) {
        setActiveByWeekdayPlanIds(new Set());
        return;
      }
      setDaysLoading(true);
      try {
        const jsDay = new Date().getDay();
        const apiDayMap = [7, 1, 2, 3, 4, 5, 6];
        const todayApiDay = apiDayMap[jsDay];

        const parseWeekdayFromDescription = (desc) => {
          if (!desc || typeof desc !== 'string') return null;
          const d = desc.toLowerCase();
          if (d.includes('segunda')) return 1;
          if (d.includes('terça') || d.includes('terca')) return 2;
          if (d.includes('quarta')) return 3;
          if (d.includes('quinta')) return 4;
          if (d.includes('sexta')) return 5;
          if (d.includes('sábado') || d.includes('sabado')) return 6;
          if (d.includes('domingo')) return 7;
          return null;
        };

        let url = `day/?limit=100`;
        const routinesWithToday = new Set();
        while (url) {
          const resp = await api.get(url);
          const data = resp.data || {};
          const results = Array.isArray(data.results) ? data.results : [];
          for (const d of results) {
            const arrRaw = Array.isArray(d?.day) ? d.day : [];
            const arr = arrRaw.map((v) => {
              const n = typeof v === 'number' ? v : parseInt(String(v), 10);
              return isNaN(n) ? v : n;
            });
            let routineVal = d?.routine;
            if (typeof routineVal === 'object' && routineVal !== null) {
              routineVal = routineVal.id ?? routineVal;
            }
            const routineNum = routineVal !== null && routineVal !== undefined ? Number(routineVal) : NaN;

            let hasToday = Array.isArray(arr) && arr.includes(todayApiDay);
            if (!hasToday && (!arr || arr.length === 0)) {
              const parsedFromDesc = parseWeekdayFromDescription(d?.description);
              hasToday = parsedFromDesc === todayApiDay;
            }
            if (hasToday && !isNaN(routineNum)) {
              routinesWithToday.add(routineNum);
            }
          }
          url = data.next || null;
        }
        setActiveByWeekdayPlanIds(routinesWithToday);
      } catch (e) {
        setActiveByWeekdayPlanIds(new Set());
      } finally {
        setDaysLoading(false);
      }
    };

    fetchDaysForWeekday();
  }, [filterByWeekday, items]);

  // Compute filtered plans based on toggles
  const filteredPlans = useMemo(() => {
    let list = items;
    if (filterByDate) {
      list = list.filter((plan) => isPlanActiveToday(plan));
    }
    if (filterByWeekday) {
      list = list.filter((plan) => activeByWeekdayPlanIds.has(Number(plan.id)));
    }
    return list;
  }, [items, filterByDate, filterByWeekday, activeByWeekdayPlanIds]);

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
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setFilterByDate(!filterByDate)}
            style={[styles.filterButton, filterByDate && styles.filterButtonActive]}
          >
            <Text style={[styles.filterButtonText, filterByDate && styles.filterButtonTextActive]}>
              Data
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterByWeekday(!filterByWeekday)}
            style={[styles.filterButton, filterByWeekday && styles.filterButtonActive]}
          >
            <Text style={[styles.filterButtonText, filterByWeekday && styles.filterButtonTextActive]}>
              Hoje
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {status === 'loading' || (filterByWeekday && daysLoading) ? (
        <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={filteredPlans}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {(filterByDate || filterByWeekday) ? 'Nenhum plano correspondente.' : 'Sem planos.'}
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
  filterRow: { flexDirection: 'row', gap: 8 },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 8,
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
