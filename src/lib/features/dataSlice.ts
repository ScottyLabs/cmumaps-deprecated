import { createSlice } from '@reduxjs/toolkit';

import {
  Building,
  BuildingCode,
  FloorLevel,
  SearchMap,
  SearchRoom,
} from '@/types';

interface DataState {
  buildings: Record<BuildingCode, Building>;
  searchMap: SearchMap;
}

const initialState: DataState = {
  buildings: {},
  searchMap: {},
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setBuildings(state, action) {
      state.buildings = action.payload;
    },
    addFloorToSearchMap(
      state,
      action: { payload: [BuildingCode, FloorLevel, SearchRoom[]] },
    ) {
      const [buidlingCode, floorLevel, floorPlan] = action.payload;
      if (!state.searchMap[buidlingCode]) {
        state.searchMap[buidlingCode] = {};
      }
      state.searchMap[buidlingCode][String(floorLevel)] = floorPlan;
    },
  },
});

export const { setBuildings, addFloorToSearchMap } = dataSlice.actions;
export default dataSlice.reducer;
