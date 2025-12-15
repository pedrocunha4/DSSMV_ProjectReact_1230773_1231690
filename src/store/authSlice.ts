import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../services/api'; // O teu ficheiro api.js
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  username: string | null; // <--- NOVO
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  username: null, // <--- NOVO
  isAuthenticated: false,
  loading: false,
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }: any, { rejectWithValue }) => {
    try {
      const response = await api.post('login/', { username, password });
      const token = response.data.token;

      await AsyncStorage.setItem('token', token);

      return token; // O que retornarmos aqui vai para o "payload" de sucesso
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Erro ao fazer login');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      AsyncStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;       // <--- Ajuste aqui
        state.username = action.payload.username; // <--- Guardar o nome
      })
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;