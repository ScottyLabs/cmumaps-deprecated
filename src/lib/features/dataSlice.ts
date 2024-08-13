import { createSlice } from '@reduxjs/toolkit';

import {
  Building,
  BuildingCode,
  CourseData,
  EateryData,
  FloorLevel,
  FloorPlan,
  FloorPlanMap,
  SearchMap,
} from '@/types';

interface DataState {
  buildings: Record<BuildingCode, Building> | null;
  eateryData: EateryData;
  searchMap: SearchMap;
  floorPlanMap: FloorPlanMap;
  courseData: CourseData | null;
  availableRoomImages: Record<string, string[]>;
}

const initialState: DataState = {
  buildings: null,
  eateryData: {},
  searchMap: {},
  floorPlanMap: {},
  courseData: null,
  availableRoomImages: {},
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
    setCourseData(state, action) {
      state.courseData = action.payload;
    },
    setAvailableRoomImages(state, action) {
      state.availableRoomImages = action.payload;
    },

    setSearchMap(state, action) {
      state.searchMap = action.payload;
    },

    setFloorPlanMap(state, action) {
      state.floorPlanMap = action.payload;
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
  setCourseData,
  setSearchMap,
  setFloorPlanMap,
  addFloorToFloorPlanMap,
  setAvailableRoomImages,
} = dataSlice.actions;
export default dataSlice.reducer;
