import { configureStore } from '@reduxjs/toolkit';
import uiSlice from './redux/uiSlice';
import navSlice from './redux/navSlice';
import dataSlice from './redux/dataSlice';

export const makeStore = () => {
  return configureStore({
    reducer: { ui: uiSlice, nav: navSlice, data: dataSlice },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
