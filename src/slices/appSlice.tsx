import { createSlice } from "@reduxjs/toolkit";

export const appSlice = createSlice({
  name: "app",
  initialState: {
    activeStep: 0,
    fileInfo: {
      frameRate: 0,
      frameCount: 0,
      width: 0,
      height: 0,
      duration: 0,
      videocodec: "",
      streams: 0,
    },
    config: {
      compression: 10,
    },
    resDivider: 4,
    fileUrl: "",
  },
  reducers: {
    advanceStep: (state) => {
      state.activeStep++;
    },
    setFileInfo: (state, action) => {
      state.fileInfo = action.payload;
    },
    setFileUrl: (state, action) => {
      state.fileUrl = action.payload;
    },
    setConfig: (state, action) => {
      state.config = action.payload;
    },
  },
});

export const { advanceStep, setFileInfo, setFileUrl, setConfig } = appSlice.actions;

export default appSlice.reducer;
