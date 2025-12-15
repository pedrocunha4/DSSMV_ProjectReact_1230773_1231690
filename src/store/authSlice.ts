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
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('login/', { username, password });
      const token = response.data.token;

      await AsyncStorage.setItem('token', token);

      return { token, username }; // Retornar token e username
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
      state.username = null;
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
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ token: string; username: string }>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.username = action.payload.username;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Erro ao fazer login';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;