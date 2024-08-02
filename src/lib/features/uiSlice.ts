import { createSlice } from '@reduxjs/toolkit';

import { Building, Floor, Room } from '@/types';

interface UIState {
  // A room/building is selected iff the user has clicked on it. And has not since clicked on another room, building, or the map.
  selectedRoom: Room | null;
  selectedBuilding: Building | null;
  focusedBuilding: Building | null;
  focusedFloor: Floor | null;
  isSearchOpen: boolean;
  roomImageList: Record<string, string[]>;

  isCardWrapperCollapsed: boolean;
}

const initialState: UIState = {
  selectedRoom: null,
  selectedBuilding: null,
  focusedBuilding: null,
  focusedFloor: null,
  isSearchOpen: false,
  roomImageList: {},
  isCardWrapperCollapsed: true,
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
    setIsCardWrapperCollapsed(state, action) {
      state.isCardWrapperCollapsed = action.payload;
    },
  },
});

export const getIsCardOpen = (state: UIState) => {
  return !!state.selectedBuilding || !!state.selectedRoom;
};

export const {
  claimRoom,
  releaseRoom,
  claimBuilding,
  releaseBuilding,
  focusBuilding,
  setFocusedFloor,
  setIsSearchOpen,
  setRoomImageList,
  setIsCardWrapperCollapsed,
} = uiSlice.actions;
export default uiSlice.reducer;
