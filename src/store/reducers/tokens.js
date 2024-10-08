import { createSlice } from "@reduxjs/toolkit";

// const DEFAULT_TOKENS_STATE = {
//   contracts: [],
//   symbols: [],
//   balances: [0, 0],
// };

export const tokens = createSlice({
  name: "tokens",
  initialState: {
    contracts: [],
    symbols: [],
    balances: [0, 0],
  },
  reducers: {
    setContracts: (state, action) => {
      state.contracts = action.payload;
    },
    setSymbols: (state, action) => {
      state.symbols = action.payload;
    },
    tokenBalancesLoaded: (state, action) => {
      state.balances = action.payload;
    },
  },
});

export const { setContracts, setSymbols, tokenBalancesLoaded } = tokens.actions;

export default tokens.reducer;
