import { Building, FloorMap } from '@/types';
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
    setLegacyFloorMap(state, action) {
      state.legacyFloorMap = action.payload;
    },
  },
});

export const { setBuildings, setFloorMap, setLegacyFloorMap } =
  dataSlice.actions;
export default dataSlice.reducer;
