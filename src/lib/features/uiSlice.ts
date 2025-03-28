import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { SearchMode } from '@/components/searchbar/searchMode';
import { Building, Floor, Room } from '@/types';

interface UIState {
  isMobile: boolean;

  // Room and Building are mutually exclusively selected.
  // (i.e: you can't select on a room and a building at the same time)
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
      if (action.payload && action.payload.id) {
        let selectionHistoryStr = localStorage.getItem('selectionHistory') || "[]";
        let selectionHistory = JSON.parse(selectionHistoryStr) as string[];
        selectionHistory.push(action.payload.id);
        localStorage.setItem('selectionHistory', JSON.stringify(selectionHistory));
      }
    },
    deselectRoom(state) {
      state.selectedRoom = null;
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
  deselectRoom,
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
