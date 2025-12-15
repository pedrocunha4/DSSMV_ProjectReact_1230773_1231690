import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addPlan, resetCreateStatus } from '../store/plansSlice';
import { AppDispatch, RootState } from '../store/store';
import { useNavigation } from '@react-navigation/native';

// TEM DE TER ESTE "export default" AQUI
export default function PlanCreateScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();

  // Se o plansSlice ainda estiver com erros, esta linha pode falhar.
  // Certifique-se que corrigiu o plansSlice.ts primeiro!
  const { createStatus } = useSelector((state: RootState) => state.plans);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Erro", "O nome é obrigatório!");
      return;
    }

    const result = await dispatch(addPlan({ name, description }));

    if (addPlan.fulfilled.match(result)) {
      Alert.alert("Sucesso", "Plano criado!");
      dispatch(resetCreateStatus());
      navigation.goBack();
    } else {
      Alert.alert("Erro", "Falha ao criar plano.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do Plano</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Hipertrofia A"
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Detalhes do treino..."
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={createStatus === 'loading'}
      >
        {createStatus === 'loading' ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>GUARDAR PLANO</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF' },
  label: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 20, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});