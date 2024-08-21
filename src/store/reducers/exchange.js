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
    buying: {
      buyOrderInProgress: false,
      buyOrderSuccessful: false,
      transactionType: null,
    },
    selling: {
      sellOrderInProgress: false,
      sellOrderSuccessful: false,
      transactionType: null,
    },
    allOrders: {
      loaded: false,
      data: [],
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
    buyOrderRequest: (state, action) => {
      state.buying.buyOrderInProgress = true;
      state.buying.buyOrderSuccessful = false;
      state.buying.transactionType = action.type;
    },
    buyOrderSuccess: (state, action) => {
      state.buying.buyOrderInProgress = false;
      state.buying.buyOrderSuccessful = true;
      state.buying.transactionType = action.type;
      state.buying.events = action.payload;
      state.buying.allOrders = action.order;
    },
    buyOrderFail: (state, action) => {
      state.buying.buyOrderInProgress = false;
      state.buying.buyOrderSuccessful = false;
      state.buying.transactionType = action.type;
      state.buying.isError = true;
    },
    sellOrderRequest: (state, action) => {
      state.selling.sellOrderInProgress = true;
      state.selling.sellOrderSuccessful = false;
      state.selling.transactionType = action.type;
    },
    sellOrderSuccess: (state, action) => {
      state.selling.sellOrderInProgress = false;
      state.selling.sellOrderSuccessful = true;
      state.selling.transactionType = action.type;
      state.selling.events = action.payload;
    },
    sellOrderFail: (state, action) => {
      state.selling.sellOrderInProgress = false;
      state.selling.sellOrderSuccessful = false;
      state.selling.transactionType = action.type;
      state.selling.isError = true;
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
  buyOrderRequest,
  buyOrderSuccess,
  buyOrderFail,
  sellOrderRequest,
  sellOrderSuccess,
  sellOrderFail,
} = exchange.actions;

export default exchange.reducer;
