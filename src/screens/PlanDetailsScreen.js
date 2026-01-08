import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDays, deleteDay } from '../store/daysSlice';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import CreateDayModal from '../components/plans/CreateDayModal';
import DayCard from '../components/plans/DayCard';

export default function PlanDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { planId, planName } = route.params;

  const dispatch = useDispatch();
  const { items: allDays, status, error } = useSelector((state) => state.days);
  const [modalVisible, setModalVisible] = useState(false);

  // Recarrega os dias sempre que o ecrã recebe foco ou quando o planId muda
  useFocusEffect(
    React.useCallback(() => {
      if (planId) {
        dispatch(fetchDays(planId));
      }
    }, [dispatch, planId])
  );

  // Filtro para garantir que apenas os dias do plano atual são mostrados
  const filteredDays = useMemo(() => {
    if (!planId || !allDays || allDays.length === 0) {
      return [];
    }
    const planIdNum = Number(planId);
    const planIdStr = String(planId);
    const onlyThisPlan = allDays.filter(day => {
      if (!day) return false;
      const routineId = day.routine || day.training || day.routine_id;
      if (routineId === null || routineId === undefined) return false;
      let routineIdValue = routineId;
      if (typeof routineId === 'object' && routineId !== null) {
        routineIdValue = routineId.id || routineId;
      }
      const routineNum = Number(routineIdValue);
      const routineStr = String(routineIdValue);
      return routineNum === planIdNum || routineStr === planIdStr;
    });
    // Sort by weekday ascending (1..7)
    return onlyThisPlan.slice().sort((a, b) => {
      const aDayArr = Array.isArray(a?.day) ? a.day : [];
      const bDayArr = Array.isArray(b?.day) ? b.day : [];
      const aDay = aDayArr.length > 0 ? Number(aDayArr[0]) : 999;
      const bDay = bDayArr.length > 0 ? Number(bDayArr[0]) : 999;
      return aDay - bDay;
    });
  }, [allDays, planId]);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    // Recarregar os dias após fechar o modal (caso tenha criado um dia)
    if (planId) {
      dispatch(fetchDays(planId));
    }
  };

  const handleDeleteDay = async (day) => {
    if (!day || !day.id) return;
    await dispatch(deleteDay(day.id));
    // Não fazemos refetch aqui para evitar mostrar loading; a lista é atualizada via reducer
  };

  const renderItem = ({ item }) => (
    <DayCard
      day={item}
      onPress={() => navigation.navigate('DayDetails', { dayId: item.id, dayName: item.description })}
      onDelete={handleDeleteDay}
    />
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
      ) : status === 'failed' ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Erro ao carregar dias</Text>
          <Text style={styles.emptySubtext}>{error || 'Tenta novamente mais tarde'}</Text>
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
      <CreateDayModal
        visible={modalVisible}
        planId={planId}
        onClose={handleCloseModal}
      />
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
    padding: 16,
    paddingBottom: 100,
    paddingTop: 8,
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
});