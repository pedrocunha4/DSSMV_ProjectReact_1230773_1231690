import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDays, addDay, clearDays } from '../store/daysSlice';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function PlanDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { planId, planName } = route.params;

  const dispatch = useDispatch();
  const { items: allDays, status } = useSelector((state) => state.days);
  const [newDayName, setNewDayName] = useState('');

  useEffect(() => {
    dispatch(fetchDays(planId));

    // Limpar lista ao sair para não misturar dados visualmente
    return () => {
      dispatch(clearDays());
    };
  }, [dispatch, planId]);

  // --- O FILTRO DE SEGURANÇA ---
  // Isto garante que só vemos dias que têm o ID deste plano.
  // A API usa 'routine' ou 'training' dependendo da versão, validamos os dois.
  const filteredDays = useMemo(() => {
    return allDays.filter(day => {
      const routineId = day.routine || day.training;
      return routineId === planId;
    });
  }, [allDays, planId]);
  // -----------------------------

  const handleAddDay = async () => {
    if (!newDayName.trim()) return;
    await dispatch(addDay({ planId, description: newDayName }));
    setNewDayName('');
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DayDetails', { dayId: item.id, dayName: item.description })}
    >
      <Text style={styles.cardText}>
        {item.description && item.description.trim() !== "" ? item.description : "Dia Sem Nome"}
      </Text>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginBottom: 10}}>
          <Text style={{fontSize: 20, color: '#007AFF'}}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{planName}</Text>
        <Text style={styles.headerSubtitle}>Gerir Dias de Treino</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nome do dia (ex: Treino A)"
          value={newDayName}
          onChangeText={setNewDayName}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddDay}>
          <Text style={styles.addButtonText}>CRIAR DIA</Text>
        </TouchableOpacity>
      </View>

      {status === 'loading' ? (
        <ActivityIndicator size="large" color="#007AFF" style={{marginTop: 20}} />
      ) : (
        <FlatList
          data={filteredDays} // <--- USAMOS A LISTA FILTRADA AQUI
          keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 50 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Este plano ainda não tem dias.</Text>
              <Text style={styles.emptySubtext}>Crie o primeiro dia acima.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 14, color: '#666' },
  inputContainer: { padding: 15, backgroundColor: '#fff', marginBottom: 10, elevation: 2 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 10, fontSize: 16, backgroundColor: '#FAFAFA' },
  addButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#FFF', fontWeight: 'bold' },
  card: { backgroundColor: '#FFF', padding: 20, marginHorizontal: 15, marginTop: 10, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', elevation: 2 },
  cardText: { fontSize: 16, fontWeight: '600', color: '#333' },
  arrow: { fontSize: 24, color: '#CCC', marginTop: -4 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#333', fontWeight: 'bold' },
  emptySubtext: { fontSize: 14, color: '#999', marginTop: 5 }
});