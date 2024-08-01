import { Building, Floor, Room } from '@/types';
import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  // A room/building is selected iff the user has clicked on it. And has not since clicked on another room, building, or the map.
  selectedRoom: Room | null;
  selectedBuilding: Building | null;
  focusedBuilding: Building | null;
  focusedFloor: Floor | null;
  isSearchOpen: boolean;
  roomImageList: Record<string, string[]>;
}

const initialState: UIState = {
  selectedRoom: null,
  selectedBuilding: null,
  focusedBuilding: null,
  focusedFloor: null,
  isSearchOpen: false,
  roomImageList: {},
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
      if (!action.payload || action.payload.id === state.selectedRoom?.id) {
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
    setFocusedFloor(state, action) {
      state.focusedFloor = action.payload;
    },
    setIsSearchOpen(state, action) {
      state.isSearchOpen = action.payload;
    },
    setRoomImageList(state, action) {
      state.roomImageList = action.payload;
    },
  },
});

export const {
  claimRoom,
  releaseRoom,
  claimBuilding,
  releaseBuilding,
  focusBuilding,
  setFocusedFloor,
  setIsSearchOpen,
  setRoomImageList,
} = uiSlice.actions;
export default uiSlice.reducer;
