import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { SearchMode } from '@/components/searchbar/searchMode';
import { Building, Floor, Room } from '@/types';

interface UIState {
  isMobile: boolean;

  // A room/building is selected iff the user has clicked on it. And has not since clicked on another room, building, or the map.
  selectedRoom: Room | null;
  selectedBuilding: Building | null;

  focusedFloor: Floor | null;
  isSearchOpen: boolean;

  isCardWrapperCollapsed: boolean;

  showRoomNames: boolean;

  searchMode: SearchMode;

  isZooming: boolean;
}

const initialState: UIState = {
  isMobile: false,
  selectedRoom: null,
  selectedBuilding: null,
  focusedFloor: null,
  isSearchOpen: false,
  isCardWrapperCollapsed: true,
  showRoomNames: false,
  searchMode: 'rooms',
  isZooming: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    claimRoom(state, action) {
      if (state.selectedRoom?.id !== action.payload?.id) {
        state.selectedRoom = action.payload;
      }
      state.selectedBuilding = null;
      state.isSearchOpen = false;
    },
    releaseRoom(state, action) {
      if (!action.payload || action.payload.id === state.selectedRoom?.id) {
        state.selectedRoom = null;
      }
    },
    setFocusedFloor(state, action: PayloadAction<Floor | null>) {
      state.focusedFloor = action.payload;
    },
    selectBuilding(state, action) {
      state.selectedRoom = null;
      state.selectedBuilding = action.payload;
    },
    deselectBuilding(state) {
      state.selectedBuilding = null;
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
    setShowRoomNames(state, action: PayloadAction<boolean>) {
      state.showRoomNames = action.payload;
    },

    setSearchMode(state, action: PayloadAction<SearchMode>) {
      state.searchMode = action.payload;
    },

    setIsZooming(state, action) {
      state.isZooming = action.payload;
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
  setIsCardWrapperCollapsed,
  setIsMobile,
  setShowRoomNames,
  setSearchMode,
  setIsZooming,
} = uiSlice.actions;
export default uiSlice.reducer;
