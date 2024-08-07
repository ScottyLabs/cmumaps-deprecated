import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { Building, Floor, Room } from '@/types';

interface UIState {
  isMobile: boolean;

  // A room/building is selected iff the user has clicked on it. And has not since clicked on another room, building, or the map.
  selectedRoom: Room | null;
  selectedBuilding: Building | null;

  focusedFloor: Floor | null;
  isSearchOpen: boolean;
  roomImageList: Record<string, string[]>;

  isCardWrapperCollapsed: boolean;

  showFloor: boolean;
  showRoomNames: boolean;
}

const initialState: UIState = {
  isMobile: false,
  selectedRoom: null,
  selectedBuilding: null,
  focusedFloor: null,
  isSearchOpen: false,
  roomImageList: {},
  isCardWrapperCollapsed: true,
  showFloor: false,
  showRoomNames: false,
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
    setFocusedFloor(state, action: PayloadAction<Floor | null>) {
      state.focusedFloor = action.payload;
    },
    selectBuilding(state, action) {
      state.selectedBuilding = action.payload;
    },
    deselectBuilding(state) {
      state.selectedBuilding = null;
    },

    setRoomImageList(state, action: PayloadAction<Record<string, string[]>>) {
      state.roomImageList = action.payload;
    },
    setIsSearchOpen(state, action: PayloadAction<boolean>) {
      state.isSearchOpen = action.payload;
    },
    setIsCardWrapperCollapsed(state, action: PayloadAction<boolean>) {
      state.isCardWrapperCollapsed = action.payload;
    },
    setIsMobile(state, action: PayloadAction<boolean>) {
      state.isMobile = action.payload;
    },
    setShowFloor(state, action: PayloadAction<boolean>) {
      state.showFloor = action.payload;
    },
    setShowRoomNames(state, action: PayloadAction<boolean>) {
      state.showRoomNames = action.payload;
    },
  },
});

export const getIsCardOpen = (state: UIState) => {
  return !!state.selectedBuilding || !!state.selectedRoom;
};

export const {
  claimRoom,
  releaseRoom,
  selectBuilding,
  deselectBuilding,
  setFocusedFloor,
  setIsSearchOpen,
  setRoomImageList,
  setIsCardWrapperCollapsed,
  setIsMobile,
  setShowFloor,
  setShowRoomNames,
} = uiSlice.actions;
export default uiSlice.reducer;
