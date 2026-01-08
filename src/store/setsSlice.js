import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchSets = createAsyncThunk(
  'sets/fetchSets',
  async (dayId, { rejectWithValue, getState }) => {
    try {
      const response = await api.get(`slot/?day=${dayId}`);
      const slots = response.data.results || [];
      const meta = (getState()?.sets?.meta) || {};

      const slotsWithDetails = await Promise.all(
        slots.map(async (slot) => {
          try {
            const entryResponse = await api.get(`slot-entry/?slot=${slot.id}`);
            const entries = entryResponse.data.results || [];

            const normalizedEntries = entries.map((entry) => {
              const local = meta[entry.id] || {};
              const reps = typeof local.reps === 'number' ? local.reps : 0;
              const sets = typeof local.sets === 'number' ? local.sets : 0;
              return { ...entry, reps, sets };
            });

            return {
              ...slot,
              entries: normalizedEntries,
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
  async ({ dayId, exerciseId, order, reps, sets }, { rejectWithValue }) => {
    try {
      const slotResponse = await api.post('slot/', {
        day: parseInt(dayId, 10),
        order: order || 1,
      });

      const createdSlot = slotResponse.data;

      const entryPayload = {
        slot: createdSlot.id,
        exercise: parseInt(exerciseId, 10),
        type: 'normal',
        repetition_unit: 1,
        weight_unit: 1,
        order: 1,
      };

      const entryResponse = await api.post('slot-entry/', entryPayload);
      const entry = entryResponse.data;

      const desiredSets = sets !== undefined && sets !== null ? Math.max(0, parseInt(sets, 10)) : 0;
      const desiredReps = reps !== undefined && reps !== null ? Math.max(0, parseInt(reps, 10)) : 0;

      return {
        slot: createdSlot,
        entry: { ...entry, reps: desiredReps, sets: desiredSets },
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao adicionar');
    }
  }
);

export const updateEntryDetails = createAsyncThunk(
  'sets/updateEntryDetails',
  async ({ entryId, sets, reps, comment }, { rejectWithValue }) => {
    try {
      if (!entryId) return rejectWithValue('entryId é obrigatório');

      let updated = null;
      if (comment !== undefined) {
        try {
          const r = await api.patch(`slot-entry/${entryId}/`, { comment });
          updated = r.data;
        } catch (e) {
        }
      }

      const desiredSets = sets !== undefined && sets !== null ? Math.max(0, parseInt(sets, 10)) : undefined;
      const desiredReps = reps !== undefined && reps !== null ? Math.max(0, parseInt(reps, 10)) : undefined;

      return {
        entryId,
        entry: {
          ...(updated || {}),
          id: entryId,
          ...(desiredSets !== undefined ? { sets: desiredSets } : {}),
          ...(desiredReps !== undefined ? { reps: desiredReps } : {}),
          ...(comment !== undefined ? { comment } : {}),
        },
        meta: {
          ...(desiredSets !== undefined ? { sets: desiredSets } : {}),
          ...(desiredReps !== undefined ? { reps: desiredReps } : {}),
        },
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao atualizar detalhes');
    }
  }
);

const setsSlice = createSlice({
  name: 'sets',
  initialState: { items: [], status: 'idle', error: null, meta: {} },
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
        const { slot, entry } = action.payload || {};
        if (!slot || !entry) return;
        state.items.push({ ...slot, entries: [entry] });
        state.meta[entry.id] = { reps: entry.reps || 0, sets: entry.sets || 0 };
      })
      .addCase(updateEntryDetails.fulfilled, (state, action) => {
        const { entryId, entry, meta } = action.payload || {};
        if (!entryId) return;
        for (const slot of state.items) {
          if (!slot?.entries) continue;
          const idx = slot.entries.findIndex((e) => e.id === entryId);
          if (idx !== -1) {
            const existing = slot.entries[idx];
            slot.entries[idx] = {
              ...existing,
              ...entry,
            };
            break;
          }
        }
        if (!state.meta[entryId]) state.meta[entryId] = {};
        if (meta?.reps !== undefined) state.meta[entryId].reps = meta.reps;
        if (meta?.sets !== undefined) state.meta[entryId].sets = meta.sets;
      });
  },
});

export const { clearSets } = setsSlice.actions;
export default setsSlice.reducer;
