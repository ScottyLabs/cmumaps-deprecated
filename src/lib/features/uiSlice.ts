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
}

const initialState: UIState = {
  isMobile: false,
  selectedRoom: null,
  selectedBuilding: null,
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
      const building = action.payload;

      if (state.selectedBuilding?.code !== building?.code) {
        state.selectedBuilding = building;
        state.focusedFloor = {
          buildingCode: building.code,
          level: building.defaultFloor,
        };
      }

      state.isSearchOpen = false;
    },
    releaseBuilding(state, action) {
      if (action.payload?.code === state.selectedBuilding?.code) {
        state.selectedBuilding = null;
      }
    },
    selectBuilding(state, action) {
      state.selectedBuilding = action.payload;
    },

    setFocusedFloor(state, action: PayloadAction<Floor>) {
      state.focusedFloor = action.payload;
    },

    setIsSearchOpen(state, action) {
      state.isSearchOpen = action.payload;
    },
    setRoomImageList(state, action) {
      state.roomImageList = action.payload;
    },
    setIsCardWrapperCollapsed(state, action: PayloadAction<boolean>) {
      state.isCardWrapperCollapsed = action.payload;
    },
    setIsMobile(state, action) {
      state.isMobile = action.payload;
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
  selectBuilding,
  setFocusedFloor,
  setIsSearchOpen,
  setRoomImageList,
  setIsCardWrapperCollapsed,
  setIsMobile,
} = uiSlice.actions;
export default uiSlice.reducer;
