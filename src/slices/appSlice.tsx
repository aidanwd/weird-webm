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
  },
});

export const { advanceStep, setFileInfo, setFileUrl } = appSlice.actions;

export default appSlice.reducer;
