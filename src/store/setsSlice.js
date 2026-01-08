import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchSets = createAsyncThunk(
  'sets/fetchSets',
  async (dayId, { rejectWithValue }) => {
    try {
      const response = await api.get(`slot/?day=${dayId}`);
      const slots = response.data.results || [];

      const slotsWithDetails = await Promise.all(
        slots.map(async (slot) => {
          try {
            const entryResponse = await api.get(`slot-entry/?slot=${slot.id}`);
            return {
              ...slot,
              entries: entryResponse.data.results || []
            };
          } catch (err) {
            return { ...slot, entries: [] };
          }
        })
      );

      return slotsWithDetails;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao buscar slots');
    }
  }
);

export const addSet = createAsyncThunk(
  'sets/addSet',
  async ({ dayId, exerciseId, order }, { rejectWithValue }) => {
    try {
      const slotResponse = await api.post('slot/', {
        day: parseInt(dayId),
        order: order || 1
      });

      const createdSlot = slotResponse.data;

      const entryResponse = await api.post('slot-entry/', {
        slot: createdSlot.id,
        exercise: parseInt(exerciseId),
        type: "normal",
        repetition_unit: 1,
        weight_unit: 1,
        order: 1
      });

      return {
        ...createdSlot,
        entries: [entryResponse.data]
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao adicionar');
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
      .addCase(fetchSets.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(addSet.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export const { clearSets } = setsSlice.actions;
export default setsSlice.reducer;