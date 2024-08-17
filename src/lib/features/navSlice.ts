import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Coordinate } from 'mapkit-react';

import { Node } from '@/app/api/findPath/route';
import { Building, Room } from '@/types';

type ChoosingRoomMode = 'start' | 'end' | null;

interface NavState {
  startLocation: Room | Building | null;
  endLocation: Room | Building | null; // This can be expanded in the future to node/ position?
  recommendedPath: { fastest: Node[]; other: Node[] } | null;
  isNavOpen: boolean;
  userPosition: Coordinate | null;
  choosingRoomMode: ChoosingRoomMode;
}

const initialState: NavState = {
  endLocation: null,
  startLocation: null,
  recommendedPath: null,
  isNavOpen: false,
  userPosition: null,
  choosingRoomMode: null,
};

const navSlice = createSlice({
  name: 'nav',
  initialState,
  reducers: {
    setUserPosition(state, action) {
      state.userPosition = action.payload;
    },
    setEndLocation(state, action) {
      state.endLocation = action.payload;
    },
    setStartLocation(state, action) {
      state.startLocation = action.payload;
    },
    setRecommendedPath(state, action) {
      state.recommendedPath = action.payload;
    },
    setIsNavOpen(state, action) {
      state.isNavOpen = action.payload;
    },
    setChoosingRoomMode(state, action: PayloadAction<ChoosingRoomMode>) {
      state.choosingRoomMode = action.payload;
    },
  },
});

export const {
  setChoosingRoomMode,
  setEndLocation,
  setStartLocation,
  setRecommendedPath,
  setIsNavOpen,
  setUserPosition,
} = navSlice.actions;
export default navSlice.reducer;
