import { Building, FloorMap, FloorPlan } from '@/types';
import { createSlice } from '@reduxjs/toolkit';

interface DataState {
  buildings: Building[] | null;
  floorMap: FloorMap | null;
  legacyFloorMap: FloorMap | null;
}

const initialState: DataState = {
  buildings: null,
  floorMap: null,
  legacyFloorMap: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setBuildings(state, action) {
      state.buildings = action.payload;
    },
    setFloorMap(state, action) {
      state.floorMap = action.payload;
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
    setLegacyFloorMap(state, action) {
      state.legacyFloorMap = action.payload;
    },
  },
});

export const { setBuildings, setFloorMap, setLegacyFloorMap, addFloorToMap } =
  dataSlice.actions;
export default dataSlice.reducer;
