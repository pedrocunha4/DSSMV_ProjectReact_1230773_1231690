import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// 1. Interface do Plano (Atualizada com os campos corretos)
export interface Plan {
  id?: number;
  name?: string;
  description?: string;
  creation_date?: string;
  start?: string; // Corrigido: era start_date
  end?: string;   // Corrigido: era end_date
}

interface PlansState {
  items: Plan[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  createStatus: 'idle' | 'loading' | 'success' | 'failed';
}

// 2. Buscar Planos (GET)
export const fetchPlans = createAsyncThunk(
  'plans/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('routine/');
      return response.data.results;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Erro ao carregar planos');
    }
  }
);

// 3. Criar Plano (POST) - AGORA COM OS CAMPOS CERTOS
export const addPlan = createAsyncThunk(
  'plans/addPlan',
  async (planData: { name: string; description: string }, { rejectWithValue }) => {
    try {
      // Datas
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const future = new Date(now);
      future.setMonth(future.getMonth() + 6);
      const next6Months = future.toISOString().split('T')[0];

      // Payload Exato que a API pediu
      const payload = {
        name: planData.name,
        description: planData.description || '',
        start: today,       // <--- CORRIGIDO (era start_date)
        end: next6Months,   // <--- CORRIGIDO (era end_date)
        fit_in_week: true,  // Adicionado conforme o seu exemplo
        is_template: false,
        is_public: false
      };

      console.log("Enviando Payload:", payload);

      const response = await api.post('routine/', payload);
      return response.data;
    } catch (err: any) {
      console.error("Erro API:", err.response?.data);
      // Retorna o erro detalhado para vermos o que falta
      return rejectWithValue(err.response?.data || 'Erro ao criar plano');
    }
  }
);

const initialState: PlansState = {
  items: [],
  status: 'idle',
  error: null,
  createStatus: 'idle',
};

const plansSlice = createSlice({
  name: 'plans',
  initialState,
  reducers: {
    resetCreateStatus: (state) => {
      state.createStatus = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(addPlan.pending, (state) => {
        state.createStatus = 'loading';
      })
      .addCase(addPlan.fulfilled, (state, action) => {
        state.createStatus = 'success';
        state.items.push(action.payload);
      })
      .addCase(addPlan.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = typeof action.payload === 'object'
          ? JSON.stringify(action.payload)
          : String(action.payload);
      });
  },
});

export const { resetCreateStatus } = plansSlice.actions;
export default plansSlice.reducer;