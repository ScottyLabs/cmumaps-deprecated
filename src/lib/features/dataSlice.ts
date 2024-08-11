import { createSlice } from '@reduxjs/toolkit';

import {
  Building,
  BuildingCode,
  EateryData,
  FloorLevel,
  FloorPlan,
  FloorPlanMap,
  SearchMap,
  SearchRoom,
} from '@/types';

interface DataState {
  buildings: Record<BuildingCode, Building> | null;
  eateryData: EateryData;
  searchMap: SearchMap;
  floorPlanMap: FloorPlanMap;
}

const initialState: DataState = {
  buildings: null,
  eateryData: {},
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
    setEateryData(state, action) {
      state.eateryData = action.payload;
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

export const {
  setBuildings,
  setEateryData,
  addFloorToSearchMap,
  addFloorToFloorPlanMap,
} = dataSlice.actions;
export default dataSlice.reducer;
