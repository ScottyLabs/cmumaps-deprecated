import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  isCardOpen: boolean;
}

const initialState: UIState = {
  isCardOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openCard(state) {
      state.isCardOpen = true;
    },
    closeCard(state) {
      state.isCardOpen = false;
    },
    toggleCard(state) {
      state.isCardOpen = !state.isCardOpen;
    },
  },
});

export const { openCard, closeCard, toggleCard } = uiSlice.actions;
export default uiSlice.reducer;
