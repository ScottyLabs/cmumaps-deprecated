import { createSlice } from '@reduxjs/toolkit';

export const cardOpenSlice = createSlice({
  name: 'cardOpen',
  initialState: {
    value: false,
    text: 'Hello World',
  },
  reducers: {
    setCardOpen: (state, action) => {
      state.value = action.payload.value;
      state.text = action.payload.text;
    },
  },
});

// Action creators are generated for each case reducer function
export const { setCardOpen } = cardOpenSlice.actions;

export default cardOpenSlice.reducer;
