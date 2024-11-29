import { createSlice } from '@reduxjs/toolkit';

import {
  Building,
  BuildingCode,
  CourseData,
  EateryData,
  FloorPlanMap,
  SearchMap,
} from '@/types';

interface DataState {
  buildings: Record<BuildingCode, Building> | null;
  eateryData: EateryData | null;
  searchMap: SearchMap | null;
  floorPlanMap: FloorPlanMap | null;
  courseData: CourseData | null;
  availableRoomImages: Record<string, string[]>;
}

const initialState: DataState = {
  buildings: null,
  eateryData: null,
  searchMap: null,
  floorPlanMap: null,
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
  },
});

export const {
  setBuildings,
  setEateryData,
  setCourseData,
  setSearchMap,
  setFloorPlanMap,
  setAvailableRoomImages,
} = dataSlice.actions;
export default dataSlice.reducer;
