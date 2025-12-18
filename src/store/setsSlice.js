// src/store/setsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// Buscar Sets de um dia específico
export const fetchSets = createAsyncThunk(
  'sets/fetchSets',
  async (dayId, { rejectWithValue }) => {
    try {
      const response = await api.get(`set/?exerciseday=${dayId}`);
      const sets = response.data.results || [];
      
      // Para cada set, buscar os settings (detalhes do exercício)
      const setsWithDetails = await Promise.all(
        sets.map(async (set) => {
          try {
            const settingsResponse = await api.get(`setting/?set=${set.id}`);
            const settings = settingsResponse.data.results || [];
            return {
              ...set,
              settings: settings
            };
          } catch (err) {
            return {
              ...set,
              settings: []
            };
          }
        })
      );
      
      return setsWithDetails;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao buscar exercícios');
    }
  }
);

// Adicionar exercício (cria Set + Setting)
export const addSet = createAsyncThunk(
  'sets/addSet',
  async ({ dayId, exerciseId, sets, reps, order }, { rejectWithValue }) => {
    try {
      // 1. Criar o Set (conjunto de séries)
      const setResponse = await api.post('set/', {
        exerciseday: dayId,
        sets: sets || 3,
        order: order || 1
      });
      
      const createdSet = setResponse.data;
      
      // 2. Criar o Setting (detalhes: exercício, reps, peso)
      const settingResponse = await api.post('setting/', {
        set: createdSet.id,
        exercise_base: exerciseId,
        reps: reps || 10,
        repetition_unit: 1, // 1 = repetições
        weight_unit: 1 // 1 = kg
      });
      
      // Retornar o set com os settings
      return {
        ...createdSet,
        settings: [settingResponse.data]
      };
    } catch (err) {
      console.error('Erro ao adicionar exercício:', err.response?.data);
      return rejectWithValue(err.response?.data || 'Erro ao adicionar exercício');
    }
  }
);

const setsSlice = createSlice({
  name: 'sets',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {
    clearSets: (state) => {
      state.items = [];
      state.status = 'idle';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchSets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addSet.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export const { clearSets } = setsSlice.actions;
export default setsSlice.reducer;