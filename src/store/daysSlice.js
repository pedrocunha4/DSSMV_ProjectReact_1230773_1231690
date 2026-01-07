import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// GET: Buscar Dias com paginação manual (a API ignora alguns filtros e é paginada)
export const fetchDays = createAsyncThunk(
  'days/fetchDays',
  async (planId, { rejectWithValue }) => {
    try {
      // A API é paginada e o filtro por routine nem sempre funciona corretamente.
      // Por isso:
      // 1. Buscamos TODAS as páginas
      // 2. Filtramos por routine === planId no cliente
      let url = `day/?limit=50`;
      let allResults = [];

      while (url) {
        const response = await api.get(url);
        const data = response.data || {};
        const results = Array.isArray(data.results) ? data.results : [];
        allResults = allResults.concat(results);
        url = data.next || null;
      }

      // Filtrar no cliente apenas os dias deste plano de treino
      const planIdNum = Number(planId);
      const planIdStr = String(planId);

      const filteredByPlan = allResults.filter((day) => {
        if (!day) return false;
        const routineId = day.routine;
        if (routineId === null || routineId === undefined) return false;

        const routineNum = Number(routineId);
        const routineStr = String(routineId);

        return routineNum === planIdNum || routineStr === planIdStr;
      });

      return filteredByPlan;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao buscar dias');
    }
  }
);

// POST: Criar Dia
export const addDay = createAsyncThunk(
  'days/addDay',
  async ({ planId, description, selectedDays }, { rejectWithValue }) => {
    try {
      const payload = {
        routine: planId, // Obrigatório ser 'routine'
        description: description,
        day: selectedDays // Array de dias da semana: [1, 3, 5] = Segunda, Quarta, Sexta
      };
      const response = await api.post('day/', payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao criar dia');
    }
  }
);

// DELETE: Eliminar Dia
export const deleteDay = createAsyncThunk(
  'days/deleteDay',
  async (dayId, { rejectWithValue }) => {
    try {
      if (!dayId) return rejectWithValue('ID do dia é obrigatório');
      await api.delete(`day/${dayId}/`);
      return dayId;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao eliminar dia');
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
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchDays.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addDay.fulfilled, (state, action) => {
        // Adiciona o novo dia ao INÍCIO da lista
        state.items.unshift(action.payload);
      })
      .addCase(deleteDay.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter((d) => d && d.id !== id);
      })
      .addCase(deleteDay.rejected, (state, action) => {
        state.error = action.payload || 'Erro ao eliminar dia';
      });
  },
});

export const { clearDays } = daysSlice.actions;
export default daysSlice.reducer;