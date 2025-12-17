import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import plansReducer from './plansSlice';
import exercisesReducer from './exercisesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plans: plansReducer,
    exercises: exercisesReducer,
  },
});

