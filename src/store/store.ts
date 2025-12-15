import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import plansReducer from './plansSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    plans: plansReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;