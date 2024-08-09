import { createSlice } from '@reduxjs/toolkit';

import {
  Building,
  BuildingCode,
  FloorLevel,
  FloorPlan,
  FloorPlanMap,
  SearchMap,
  SearchRoom,
} from '@/types';

interface DataState {
  buildings: Record<BuildingCode, Building> | null;
  searchMap: SearchMap;
  floorPlanMap: FloorPlanMap;
}

const initialState: DataState = {
  buildings: null,
  searchMap: {},
  floorPlanMap: {},
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
      state.searchMap[buidlingCode][floorLevel] = floorPlan;
    },
    addFloorToFloorPlanMap(
      state,
      action: { payload: [BuildingCode, FloorLevel, FloorPlan] },
    ) {
      const [buidlingCode, floorLevel, floorPlan] = action.payload;
      if (!state.floorPlanMap[buidlingCode]) {
        state.floorPlanMap[buidlingCode] = {};
      }
      state.floorPlanMap[buidlingCode][floorLevel] = floorPlan;
    },
  },
});

export const { setBuildings, addFloorToSearchMap, addFloorToFloorPlanMap } =
  dataSlice.actions;
export default dataSlice.reducer;
