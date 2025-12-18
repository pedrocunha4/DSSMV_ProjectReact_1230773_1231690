import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// GET: Buscar Dias (CORRIGIDO: usa 'routine' em vez de 'training')
export const fetchDays = createAsyncThunk(
  'days/fetchDays',
  async (planId, { rejectWithValue }) => {
    try {
      // O filtro CORRETO é 'routine'. Se usarmos 'training', a API ignora e devolve tudo.
      const response = await api.get(`day/?routine=${planId}`);
      return response.data.results;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao buscar dias');
    }
  }
);

// POST: Criar Dia
export const addDay = createAsyncThunk(
  'days/addDay',
  async ({ planId, description }, { rejectWithValue }) => {
    try {
      const payload = {
        routine: planId, // Obrigatório ser 'routine'
        description: description,
        day: [1]
      };
      const response = await api.post('day/', payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao criar dia');
    }
  }
);

const daysSlice = createSlice({
  name: 'days',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {
    // Ação para limpar a lista quando saímos do ecrã
    clearDays: (state) => {
      state.items = [];
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDays.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDays.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchDays.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addDay.fulfilled, (state, action) => {
        // Adiciona o novo dia ao INÍCIO da lista
        state.items.unshift(action.payload);
      });
  },
});

export const { clearDays } = daysSlice.actions;
export default daysSlice.reducer;