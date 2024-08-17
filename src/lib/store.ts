import { configureStore } from '@reduxjs/toolkit';

import dataSlice from './features/dataSlice';
import navSlice from './features/navSlice';
import uiSlice from './features/uiSlice';

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
