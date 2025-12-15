import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchPlans = createAsyncThunk(
  'plans/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      // Wger API: Endpoint para listar treinos (routines)
      const response = await api.get('workout/');
      return response.data.results; // A lista de planos vem dentro de 'results'
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Erro ao carregar planos');
    }
  }
);

// 2. Estado Inicial
const initialState = {
  items: [],      // A lista de planos
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// 3. Slice (Reducers)
const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {}, // Ações síncronas (ex: limpar lista localmente) podem vir aqui
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload; // Guarda os planos vindos da API
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.status = 'failed';
        // @ts-ignore
        state.error = action.payload;
      });
  },
});

export default plansSlice.reducer;