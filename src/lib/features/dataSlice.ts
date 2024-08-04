import { createSlice } from '@reduxjs/toolkit';

import {
  Building,
  BuildingCode,
  FloorLevel,
  FloorMap,
  SearchMap,
  SearchRoom,
} from '@/types';

interface DataState {
  buildings: Record<BuildingCode, Building>;
  floorMap: FloorMap;
  searchMap: SearchMap;
}

const initialState: DataState = {
  buildings: {},
  floorMap: {},
  searchMap: {},
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setBuildings(state, action) {
      state.buildings = action.payload;
    },
    // addFloorToMap(state, action: { payload: [string, FloorPlan] }) {
    //   const [floorName, floorPlan] = action.payload;
    //   state.floorMap[floorName] = floorPlan;
    // },
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
  },
});

export const { setBuildings, addFloorToSearchMap } = dataSlice.actions;
export default dataSlice.reducer;
