// Import the RTK Query methods from the React-specific entry point
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { FloorPlan } from '../../types';

// Define our single API slice object
export const apiSlice = createApi({
  // The cache reducer expects to be added at `state.api` (already default - this is optional)
  reducerPath: 'api',
  // All of our requests will have URLs starting with '/fakeApi'
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  // The "endpoints" represent operations and requests for this server
  endpoints: (builder) => ({
    getFloor: builder.query<
      { floorPlan: FloorPlan },
      { buildingCode: string; floorLevel: string }
    >({
      query: ({ buildingCode, floorLevel }) => {
        return {
          url: 'getFloorPlan',
          method: 'GET',
          headers: { buildingCode, floorLevel },
        };
      },
    }),
  }),
});

// Export the auto-generated hook for the `getPosts` query endpoint
export const { useGetFloorQuery } = apiSlice;
