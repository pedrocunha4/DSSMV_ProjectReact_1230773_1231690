import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const META_STORAGE_KEY = 'setsMeta';

export const fetchSets = createAsyncThunk(
  'sets/fetchSets',
  async (dayId, { rejectWithValue }) => {
    try {
      const response = await api.get(`slot/?day=${dayId}`);
      const slots = response.data.results || [];

      // Load persisted meta from storage
      let persistedMeta = {};
      try {
        const raw = await AsyncStorage.getItem(META_STORAGE_KEY);
        if (raw) persistedMeta = JSON.parse(raw);
      } catch (e) {
        persistedMeta = {};
      }

      const slotsWithDetails = await Promise.all(
        slots.map(async (slot) => {
          try {
            const entryResponse = await api.get(`slot-entry/?slot=${slot.id}`);
            const entries = entryResponse.data.results || [];

            const normalizedEntries = entries.map((entry) => {
              const local = persistedMeta[entry.id] || {};
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
  async ({ dayId, exerciseId, order, reps, sets }, { rejectWithValue, getState }) => {
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

      // Persist meta
      try {
        const raw = await AsyncStorage.getItem(META_STORAGE_KEY);
        const meta = raw ? JSON.parse(raw) : {};
        meta[entry.id] = { reps: desiredReps, sets: desiredSets };
        await AsyncStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
      } catch (e) {
        // ignore
      }

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
          // ignore comment failure to keep UX responsive
        }
      }

      const desiredSets = sets !== undefined && sets !== null ? Math.max(0, parseInt(sets, 10)) : undefined;
      const desiredReps = reps !== undefined && reps !== null ? Math.max(0, parseInt(reps, 10)) : undefined;

      // Persist meta
      try {
        const raw = await AsyncStorage.getItem(META_STORAGE_KEY);
        const meta = raw ? JSON.parse(raw) : {};
        if (!meta[entryId]) meta[entryId] = {};
        if (desiredSets !== undefined) meta[entryId].sets = desiredSets;
        if (desiredReps !== undefined) meta[entryId].reps = desiredReps;
        await AsyncStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
      } catch (e) {
        // ignore
      }

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

// Delete a slot (remove exercise from day) and clean meta
export const deleteSlot = createAsyncThunk(
  'sets/deleteSlot',
  async ({ slotId, entryId }, { rejectWithValue }) => {
    try {
      if (!slotId) return rejectWithValue('slotId é obrigatório');
      await api.delete(`slot/${slotId}/`);

      // Clean meta
      try {
        const raw = await AsyncStorage.getItem(META_STORAGE_KEY);
        const meta = raw ? JSON.parse(raw) : {};
        if (entryId && meta[entryId]) {
          delete meta[entryId];
          await AsyncStorage.setItem(META_STORAGE_KEY, JSON.stringify(meta));
        }
      } catch (e) {}

      return { slotId, entryId };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao remover exercício');
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
      // Keep meta to survive navigation within app; it's persisted to storage
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
      })
      .addCase(deleteSlot.fulfilled, (state, action) => {
        const { slotId, entryId } = action.payload || {};
        state.items = state.items.filter((s) => s && s.id !== slotId);
        if (entryId && state.meta[entryId]) {
          delete state.meta[entryId];
        }
      });
  },
});

export const { clearSets } = setsSlice.actions;
export default setsSlice.reducer;
