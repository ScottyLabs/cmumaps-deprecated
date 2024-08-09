import { createSlice } from '@reduxjs/toolkit';
import { Coordinate } from 'mapkit-react';

import { Node } from '@/app/api/findPath/route';
import { Room } from '@/types';

interface NavState {
  endRoom: Room | null; // This can be expanded in the future to Building, ... node/ position?
  startRoom: Room | null;
  recommendedPath: Node[] | null;
  isNavOpen: boolean;
  userPosition: Coordinate | null;
}

const initialState: NavState = {
  endRoom: null,
  startRoom: null,
  recommendedPath: null,
  isNavOpen: false,
  userPosition: null,
};

const navSlice = createSlice({
  name: 'nav',
  initialState,
  reducers: {
    setUserPosition(state, action) {
      state.userPosition = action.payload;
    },
    setEndRoom(state, action) {
      state.endRoom = action.payload;
    },
    setStartRoom(state, action) {
      state.startRoom = action.payload;
    },
    setRecommendedPath(state, action) {
      state.recommendedPath = action.payload;
    },
    setIsNavOpen(state, action) {
      state.isNavOpen = action.payload;
    },
  },
});

export const {
  setEndRoom,
  setStartRoom,
  setRecommendedPath,
  setIsNavOpen,
  setUserPosition,
} = navSlice.actions;
export default navSlice.reducer;
