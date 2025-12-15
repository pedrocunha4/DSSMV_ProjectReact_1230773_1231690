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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;