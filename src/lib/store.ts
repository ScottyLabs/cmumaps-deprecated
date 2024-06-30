import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counter/counterSlice';
import cardOpenSlice from './features/cardOpen/cardOpenSlice';

export const makeStore = () => {
  return configureStore({
    reducer: { counter: counterReducer, cardOpen: cardOpenSlice },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
