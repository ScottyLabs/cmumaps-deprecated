import { Building, Room } from '@/types';
import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  // A room/building is selected iff the user has clicked on it. And has not since clicked on another room, building, or the map.
  selectedRoom: Room | null;
  selectedBuilding: Building | null;
  focusedBuilding: Building | null;
  floorOrdinal: number | null;
  isSearchOpen: boolean;
}

const initialState: UIState = {
  selectedRoom: null,
  selectedBuilding: null,
  focusedBuilding: null,
  floorOrdinal: null,
  isSearchOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    claimRoom(state, action) {
      if (state.selectedRoom?.id !== action.payload?.id) {
        state.selectedRoom = action.payload;
      }
      state.isSearchOpen = false;
    },
    releaseRoom(state, action) {
      if (action.payload?.id === state.selectedRoom?.id) {
        state.selectedRoom = null;
        state.selectedBuilding = null;
      }
    },
    claimBuilding(state, action) {
      if (state.selectedBuilding?.code !== action.payload?.code) {
        state.selectedBuilding = action.payload;
        state.focusedBuilding = action.payload;
      }
      state.isSearchOpen = false;
    },
    releaseBuilding(state, action) {
      if (action.payload?.code === state.selectedBuilding?.code) {
        state.selectedBuilding = null;
      }
    },
    focusBuilding(state, action) {
      state.focusedBuilding = action.payload;
    },
    setFloorOrdinal(state, action) {
      state.floorOrdinal = action.payload;
    },
    setIsSearchOpen(state, action) {
      state.isSearchOpen = action.payload;
    },
  },
});

export const {
  claimRoom,
  releaseRoom,
  claimBuilding,
  releaseBuilding,
  focusBuilding,
  setFloorOrdinal,
  setIsSearchOpen,
} = uiSlice.actions;
export default uiSlice.reducer;
