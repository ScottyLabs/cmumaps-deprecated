import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Coordinate } from 'mapkit-react';

import { Node } from '@/app/api/findPath/route';
import { Building, Room } from '@/types';

type ChoosingRoomMode = 'start' | 'end' | null;

interface NavState {
  startLocation: Room | Building | null;
  endLocation: Room | Building | null; // This can be expanded in the future to node/ position?
  recommendedPath: Record<string, { path: Node[]; distance: number }> | null;
  startedNavigation: boolean;

  curFloorIndex: number;
  selectedPathName: string;

  isNavOpen: boolean;
  userPosition: Coordinate | null;
  choosingRoomMode: ChoosingRoomMode;
}

const initialState: NavState = {
  endLocation: null,
  startLocation: null,
  recommendedPath: null,
  selectedPathName: '',
  isNavOpen: false,
  userPosition: null,
  choosingRoomMode: null,
  startedNavigation: false,
  curFloorIndex: 0,
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

    setSelectedPathName(state, action) {
      state.selectedPathName = action.payload;
    },

    setStartedNavigation(state, action) {
      state.startedNavigation = action.payload;
    },

    setCurFloorIndex(state, action) {
      state.curFloorIndex = action.payload;
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
  setSelectedPathName,
  setStartedNavigation,
  setCurFloorIndex,
} = navSlice.actions;
export default navSlice.reducer;
