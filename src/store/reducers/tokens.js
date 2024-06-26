import { createSlice } from "@reduxjs/toolkit";

const DEFAULT_TOKENS_STATE = {
  contracts: [],
  symbols: [],
  balances: [0, 0],
};

export const tokens = createSlice({
  name: "tokens",
  initialState: { DEFAULT_TOKENS_STATE },
  reducers: {
    setContracts: (state, action) => {
      state.contracts = action.payload;
    },
    setSymbols: (state, action) => {
      state.symbols = action.payload;
    },
    balancesLoaded: (state, action) => {
      state.balances = action.payload;
    },
  },
});

export const { setContracts, setSymbols, balancesLoaded } = tokens.actions;

export default tokens.reducer;
