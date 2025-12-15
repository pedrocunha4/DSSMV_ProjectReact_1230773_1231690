import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { loginUser } from '../store/authSlice';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (error) {
      Alert.alert('Erro de Login', 'Verifique o utilizador e a password.');
    }
    if (isAuthenticated) {
      Alert.alert('Sucesso!', 'Login efetuado com a API Wger.');
    }
  }, [error, isAuthenticated]);

  const handleLogin = () => {
    if (username.length === 0 || password.length === 0) {
      Alert.alert('Aviso', 'Preencha todos os campos.');
      return;
    }

    dispatch(loginUser({ username, password }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>PP Workout</Text>
      <Text style={styles.subtitle}>Login via API Wger</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text style={styles.buttonText}>ENTRAR</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#F5F5F5' },
  title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, color: '#666' },
  inputContainer: { marginBottom: 20 },
  input: { backgroundColor: '#FFF', borderRadius: 8, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#DDD' },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: 'bold' }
});