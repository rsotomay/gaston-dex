import { createSlice } from "@reduxjs/toolkit";

export const exchange = createSlice({
  name: "exchange",
  initialState: {
    contract: null,
    balances: [0, 0],
    depositing: {
      depositInProgress: false,
      depositSuccessful: false,
      transferType: null,
    },
    withdrawing: {
      withdrawInProgress: false,
      withdrawSuccessful: false,
      transferType: null,
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
      state.depositing.transferType = action.type;
    },
    depositSuccess: (state, action) => {
      state.depositing.depositInProgress = false;
      state.depositing.depositSuccessful = true;
      state.depositing.transferType = action.type;
      state.depositing.events = action.payload;
    },
    depositFail: (state, action) => {
      state.depositing.depositInProgress = false;
      state.depositing.depositSuccessful = false;
      state.depositing.transferType = action.type;
      state.depositing.isError = true;
    },
    // Withdraws
    withdrawRequest: (state, action) => {
      state.withdrawing.withdrawInProgress = true;
      state.withdrawing.withdrawSuccessful = false;
      state.withdrawing.transferType = action.type;
    },
    withdrawSuccess: (state, action) => {
      state.withdrawing.withdrawInProgress = false;
      state.withdrawing.withdrawSuccessful = true;
      state.withdrawing.transferType = action.type;
      state.withdrawing.events = action.payload;
    },
    withdrawFail: (state, action) => {
      state.withdrawing.withdrawInProgress = false;
      state.withdrawing.withdrawSuccessful = false;
      state.withdrawing.transferType = action.type;
      state.withdrawing.isError = true;
    },
  },
});

export const {
  setExchange,
  exchangeBalancesLoaded,
  depositRequest,
  depositSuccess,
  depositFail,
  withdrawRequest,
  withdrawSuccess,
  withdrawFail,
} = exchange.actions;

export default exchange.reducer;
