// src/store/setsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchSets = createAsyncThunk(
  'sets/fetchSets',
  async (dayId, { rejectWithValue }) => {
    try {
      const response = await api.get(`set/?exerciseday=${dayId}`);
      return response.data.results;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao buscar exercícios');
    }
  }
);

export const addSet = createAsyncThunk(
  'sets/addSet',
  async ({ dayId, exerciseId, sets, reps }, { rejectWithValue }) => {
    try {
      const response = await api.post('set/', {
        exerciseday: dayId,
        exercise: exerciseId,
        sets: sets || 3,
        reps: reps || 10
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Erro ao adicionar exercício');
    }
  }
);

const setsSlice = createSlice({
  name: 'sets',
  initialState: { items: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(addSet.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default setsSlice.reducer;