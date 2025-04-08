import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface StorageState {
  data: Record<string, string>;
}

const initialState: StorageState = {
  data: {},
};

const storageSlice = createSlice({
  name: "storage",
  initialState,
  reducers: {
    readFromLocalStorage: (state) => {
      Object.entries(localStorage).forEach(([key, value]) => {
        state.data[key] = value;
      });
    },
    setKey: (state, action: PayloadAction<{ key: string; value: string }>) => {
      const { key, value } = action.payload;
      state.data[key] = value;

      //Asynchronously save to local storage
      (async () => {
        localStorage.setItem(key, value);
      })();
    },
    removeKey: (state, action) => {
      const { key } = action.payload;

      if (state.data[key]) {
        delete state.data[key];
        localStorage.removeItem(key);
      }
    },
  },
});

export const { readFromLocalStorage, setKey, removeKey } = storageSlice.actions;

export default storageSlice.reducer;
