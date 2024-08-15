import { createSlice } from "@reduxjs/toolkit";

export const exchange = createSlice({
  name: "exchange",
  initialState: {
    contract: null,
    balances: [0, 0],
    depositing: {
      depositInProgress: false,
      depositSuccessful: false,
      transactionType: null,
    },
    events: [],
  },
  reducers: {
    setExchange: (state, action) => {
      state.contract = action.payload;
    },
    //Balances
    exchangeBalancesLoaded: (state, action) => {
      state.balances = action.payload;
    },
    // Deposits
    depositRequest: (state, action) => {
      state.depositing.depositInProgress = true;
      state.depositing.depositSuccessful = false;
      state.depositing.transactionType = action.type;
    },
    depositSuccess: (state, action) => {
      state.depositing.depositInProgress = false;
      state.depositing.depositSuccessful = true;
      state.depositing.transactionType = action.type;
      state.depositing.events = action.payload;
    },
    depositFail: (state, action) => {
      state.depositing.depositInProgress = false;
      state.depositing.depositSuccessful = false;
      state.depositing.transactionType = action.type;
      state.depositing.isError = true;
    },
  },
});

export const {
  setExchange,
  exchangeBalancesLoaded,
  depositRequest,
  depositSuccess,
  depositFail,
} = exchange.actions;

export default exchange.reducer;
