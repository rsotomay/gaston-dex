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
    exchangeBalancesLoaded: (state, action) => {
      state.balances = action.payload;
    },
  },
});

export const { setExchange, exchangeBalancesLoaded } = exchange.actions;

export default exchange.reducer;
