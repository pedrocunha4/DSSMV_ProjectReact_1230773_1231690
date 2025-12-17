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
      const next6Months = future.toISOString().split('T')[0];

      const payload = {
        name: planData.name,
        description: planData.description || '',
        start: today,
        end: next6Months,
        fit_in_week: true,
        is_template: false,
        is_public: false
      };

      console.log("Enviando Payload:", payload);

      const response = await api.post('routine/', payload);
      return response.data;
    } catch (err) {
      console.error("Erro API:", err.response?.data);
      return rejectWithValue(err.response?.data || 'Erro ao criar plano');
    }
  }
);

const initialState = {
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
      .addCase(fetchPlans.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addPlan.pending, (state) => {
        state.createStatus = 'loading';
        state.error = null;
      })
      .addCase(addPlan.fulfilled, (state, action) => {
        state.createStatus = 'success';
        state.items.unshift(action.payload);
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

