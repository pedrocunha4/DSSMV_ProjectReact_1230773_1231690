import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import plansReducer from './plansSlice';
import exercisesReducer from './exercisesSlice';
import daysReducer from './daysSlice';
import setsReducer from './setsSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    plans: plansReducer,
    exercises: exercisesReducer,
    days: daysReducer,
    sets: setsReducer,
  },
});

