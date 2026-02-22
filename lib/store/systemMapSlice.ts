import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { SystemMapData } from "../types";
import { fetchSystemMapData } from "../systemMap";

interface SystemMapState {
  baseUrl: string;
  data: SystemMapData | null;
  loading: boolean;
  error: string | null;
}

const initialState: SystemMapState = {
  baseUrl: "https://letsplay.minecrafttransitrailway.com/system-map",
  data: null,
  loading: false,
  error: null,
};

export const fetchSystemMap = createAsyncThunk(
  "systemMap/fetch",
  async (baseUrl: string) => {
    return await fetchSystemMapData(baseUrl);
  }
);

export const systemMapSlice = createSlice({
  name: "systemMap",
  initialState,
  reducers: {
    setBaseUrl(state, action) {
      state.baseUrl = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemMap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemMap.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSystemMap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch system map data";
      });
  },
});

export const { setBaseUrl } = systemMapSlice.actions;
export default systemMapSlice.reducer;
