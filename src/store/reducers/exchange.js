import { createSlice } from "@reduxjs/toolkit";

export const exchange = createSlice({
  name: "exchange",
  initialState: {
    contract: null,
  },
  reducers: {
    setExchange: (state, action) => {
      state.contract = action.payload;
    },
  },
});

export const { setExchange } = exchange.actions;

export default exchange.reducer;
