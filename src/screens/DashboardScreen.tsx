import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchPlans } from '../store/plansSlice';
import { logout } from '../store/authSlice'; // Para o botão de sair

export default function DashboardScreen() {
  const dispatch = useDispatch<AppDispatch>();

  // Ler dados do Redux (FLUX: View lê da Store)
  const { items, status, error } = useSelector((state: RootState) => state.plans);
  // const { username } = useSelector((state: RootState) => state.auth); // (Opcional se guardares o user)

  // Carregar dados ao iniciar o ecrã (FLUX: View dispara Action)
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPlans());
    }
  }, [status, dispatch]);

  const handleLogout = () => {
    dispatch(logout()); // Isto vai fazer o App.tsx mudar automaticamente para o Login
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => Alert.alert('Detalhes', `Clicaste no plano: ${item.comment || 'Sem nome'}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.planName}>{item.comment || 'Plano Sem Nome'}</Text>
        <Text style={styles.planDate}>{item.creation_date}</Text>
      </View>
      <Text style={styles.planDescription}>
        {item.description || 'Sem descrição definida.'}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>Meus Planos</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Conteúdo Principal */}
      {status === 'loading' ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      ) : status === 'failed' ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Erro ao carregar planos.</Text>
          <Text>{String(error)}</Text>
          <TouchableOpacity onPress={() => dispatch(fetchPlans())} style={styles.retryButton}>
            <Text style={styles.retryText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Não tens planos criados ainda.</Text>
          }
        />
      )}

      {/* FAB (Botão Flutuante) para Criar Plano */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => Alert.alert('Novo Plano', 'Aqui abriria o formulário de criar plano.')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    elevation: 4, // Sombra Android
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  logoutButton: { padding: 10 },
  logoutText: { color: 'red', fontWeight: 'bold' },

  listContent: { padding: 15 },
  card: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  planName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  planDate: { fontSize: 12, color: '#999' },
  planDescription: { fontSize: 14, color: '#666' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: 'red', marginBottom: 10 },
  retryButton: { padding: 10, backgroundColor: '#007AFF', borderRadius: 5 },
  retryText: { color: '#FFF' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },

  fab: {
    position: 'absolute',
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    elevation: 8,
  },
  fabText: { fontSize: 30, color: '#FFF', marginTop: -2 },
});