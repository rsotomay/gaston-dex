import { createSlice } from "@reduxjs/toolkit";

export const provider = createSlice({
  name: "provider",
  initialState: {
    connection: null,
    chainId: null,
    account: null,
    balance: null,
  },
  reducers: {
    setProvider: (state, action) => {
      state.connection = action.payload;
    },
    setNetwork: (state, action) => {
      state.chainId = action.payload;
    },
    setAccount: (state, action) => {
      state.account = action.payload;
    },
    setBalance: (state, action) => {
      state.balance = action.payload;
    },
  },
});

export const { setProvider, setNetwork, setAccount, setBalance } =
  provider.actions;

export default provider.reducer;
