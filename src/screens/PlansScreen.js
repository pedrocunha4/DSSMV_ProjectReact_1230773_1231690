import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlans } from '../store/plansSlice';
import { useNavigation } from '@react-navigation/native';

export default function PlansScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { items, status } = useSelector((state) => state.plans);

  useEffect(() => {
    // Garante que busca apenas os planos atualizados (filtro is_public=false já está no slice)
    dispatch(fetchPlans());
  }, [dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      // ADICIONADO: Navegação para o ecrã de detalhes (Dias)
      onPress={() => navigation.navigate('PlanDetails', {
        planId: item.id,
        planName: item.name || item.comment || 'Sem Nome'
      })}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.planIcon}>
            <Text style={styles.planIconText}>📋</Text>
          </View>
          <View style={styles.planInfo}>
            <Text style={styles.planName} numberOfLines={1}>
              {item.name || item.comment || 'Sem Nome'}
            </Text>
            <Text style={styles.planDesc} numberOfLines={2}>
              {item.description || item.goal || 'Sem descrição'}
            </Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.planDate}>{formatDate(item.creation_date)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header Azul */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Planos</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Conteúdo */}
      {status === 'loading' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>A carregar planos...</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => (item.id ? item.id.toString() : Math.random().toString())}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Nenhum plano encontrado</Text>
              <Text style={styles.emptySubtext}>Crie o seu primeiro plano de treino!</Text>
            </View>
          }
        />
      )}

      {/* Botão Flutuante para criar NOVO PLANO */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PlanCreate')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  planIconText: {
    fontSize: 24,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  planDesc: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  planDate: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '500',
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
});