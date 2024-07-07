import { node } from '@/app/api/findPath/route';
import { Room } from '@/types';
import { createSlice } from '@reduxjs/toolkit';

interface NavState {
  endRoom: Room | null; // This can be expanded in the future to Building, ... node/ position?
  startRoom: Room | null;
  recommendedPath: node[] | null;
}

const initialState: NavState = {
  endRoom: null,
  startRoom: null,
  recommendedPath: null,
};

const navSlice = createSlice({
  name: 'nav',
  initialState,
  reducers: {
    setEndRoom(state, action) {
      console.log(action.payload);
      state.endRoom = action.payload;
    },
    setStartRoom(state, action) {
      state.startRoom = action.payload;
    },
    setRecommendedPath(state, action) {
      state.recommendedPath = action.payload;
    },
  },
});

export const { setEndRoom, setStartRoom, setRecommendedPath } =
  navSlice.actions;
export default navSlice.reducer;
