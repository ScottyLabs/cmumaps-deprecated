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

  isFloorPlanRendered: boolean;
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
  isFloorPlanRendered: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectRoom(state, action) {
      state.selectedRoom = action.payload;
      state.selectedBuilding = null;
      state.isSearchOpen = false;
    },
    setFocusedFloor(state, action: PayloadAction<Floor | null>) {
      state.focusedFloor = action.payload;
      state.isFloorPlanRendered = false;
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

    setIsFloorPlanRendered(state, action) {
      state.isFloorPlanRendered = action.payload;
    },
  },
});

export const getIsCardOpen = (state: UIState) => {
  return !!state.selectedBuilding || !!state.selectedRoom;
};

export const {
  selectRoom,
  selectBuilding,
  deselectBuilding,
  setFocusedFloor,
  setIsSearchOpen,
  setIsCardWrapperCollapsed,
  setIsMobile,
  setShowRoomNames,
  setSearchMode,
  setIsZooming,
  setIsFloorPlanRendered,
} = uiSlice.actions;
export default uiSlice.reducer;
