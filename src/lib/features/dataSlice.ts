import { Building, FloorMap, FloorPlan } from '@/types';
import { createSlice } from '@reduxjs/toolkit';

interface DataState {
  buildings: Building[];
  floorMap: FloorMap;
}

const initialState: DataState = {
  buildings: [],
  floorMap: {},
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setBuildings(state, action) {
      state.buildings = action.payload;
    },
    addFloorToMap(state, action: { payload: [string, FloorPlan] }) {
      const [floorName, floorPlan] = action.payload;
      Object.values(floorPlan.rooms).forEach((room) => {
        room.floor = floorName;
      });
      if (!state.floorMap) {
        state.floorMap = {};
      }
      state.floorMap[floorName] = floorPlan;
    },
  },
});

export const { setBuildings, addFloorToMap } = dataSlice.actions;
export default dataSlice.reducer;
