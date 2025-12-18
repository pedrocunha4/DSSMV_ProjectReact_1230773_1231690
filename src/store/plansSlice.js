import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchPlans = createAsyncThunk(
  'plans/fetchPlans',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('routine/?is_public=false');
      return response.data.results;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao carregar planos');
    }
  }
);

export const addPlan = createAsyncThunk(
  'plans/addPlan',
  async (planData, { rejectWithValue }) => {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const future = new Date(now);
      future.setMonth(future.getMonth() + 6);

      const payload = {
        name: planData.name,
        description: planData.description || '',
        start: today,
        end: future.toISOString().split('T')[0],
        fit_in_week: true,
        is_template: false,
        is_public: false
      };

      const response = await api.post('routine/', payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao criar plano');
    }
  }
);

export const updatePlan = createAsyncThunk(
  'plans/updatePlan',
  async ({ id, name, description, start, end }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`routine/${id}/`, {
        name,
        description,
        start,
        end
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao editar plano');
    }
  }
);

export const deletePlan = createAsyncThunk(
  'plans/deletePlan',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`routine/${id}/`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao apagar plano');
    }
  }
);

const plansSlice = createSlice({
  name: 'plans',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    createStatus: 'idle',
  },
  reducers: {
    resetCreateStatus: (state) => {
      state.createStatus = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlans.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addPlan.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updatePlan.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
      });
  },
});

export const { resetCreateStatus } = plansSlice.actions;
export default plansSlice.reducer;