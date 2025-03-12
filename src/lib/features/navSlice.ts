import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Coordinate } from 'mapkit-react';

import { Node, Waypoint } from '@/types';

type ChoosingRoomMode = 'start' | 'end' | null;

interface NavState {
  startLocation: Waypoint | null;
  endLocation: Waypoint | null;
  recommendedPath: Record<string, { path: Node[]; distance: number }> | null;
  startedNavigation: boolean;

  curFloorIndex: number;
  selectedPathNum: number;

  isNavOpen: boolean;
  userPosition: Coordinate | null;
  choosingRoomMode: ChoosingRoomMode;
}

const initialState: NavState = {
  endLocation: null,
  startLocation: null,
  recommendedPath: null,
  selectedPathNum: 0,
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
      state.recommendedPath = action.payload as Record<
        string,
        { path: Node[]; distance: number }
      > | null;
    },
    setIsNavOpen(state, action) {
      state.isNavOpen = action.payload;
    },
    setChoosingRoomMode(state, action: PayloadAction<ChoosingRoomMode>) {
      state.choosingRoomMode = action.payload;
    },

    setSelectedPathNum(state, action) {
      state.selectedPathNum = action.payload;
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
  setSelectedPathNum,
  setStartedNavigation,
  setCurFloorIndex,
} = navSlice.actions;
export default navSlice.reducer;
