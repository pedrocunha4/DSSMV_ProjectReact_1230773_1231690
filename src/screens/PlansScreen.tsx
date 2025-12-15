import React, { useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { fetchPlans } from '../store/plansSlice';
import { useNavigation } from '@react-navigation/native';

export default function PlansScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();

  const { items, status, error } = useSelector((state: RootState) => state.plans);

  useEffect(() => {
    dispatch(fetchPlans());
  }, [dispatch]);

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <Text style={styles.planName}>{item.name || item.comment || 'Sem Nome'}</Text>
      <Text style={styles.planDesc}>{item.description || 'Sem descrição'}</Text>
      <Text style={styles.planDate}>{item.creation_date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {status === 'loading' ? (
        <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum plano encontrado.</Text>}
        />
      )}

      {/* Botão Flutuante para criar NOVO PLANO */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('PlanCreate')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 15 },
  card: { backgroundColor: '#FFF', padding: 15, borderRadius: 10, marginBottom: 10, elevation: 2 },
  planName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  planDesc: { fontSize: 14, color: '#666', marginVertical: 5 },
  planDate: { fontSize: 12, color: '#999', textAlign: 'right' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
  fab: {
    position: 'absolute', bottom: 20, right: 20,
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#007AFF',
    alignItems: 'center', justifyContent: 'center', elevation: 5
  },
  fabText: { fontSize: 30, color: '#FFF', marginTop: -3 }
});