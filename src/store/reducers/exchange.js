import { createSlice } from "@reduxjs/toolkit";

export const exchange = createSlice({
  name: "exchange",
  initialState: {
    contract: null,
    balances: [0, 0],
    transfering: {
      transferInProgress: false,
      transferSuccessful: false,
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

    allOrders: [],

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
    // Orders
    ordersLoaded: (state, action) => {
      state.allOrders = action.payload;
    },
    // Deposits & Withdrawals
    transferRequest: (state, action) => {
      state.transfering.transferInProgress = true;
      state.transfering.transferSuccessful = false;
      state.transfering.transferType = action.type;
    },
    transferSuccess: (state, action) => {
      state.transfering.transferInProgress = false;
      state.transfering.transferSuccessful = true;
      state.transfering.transferType = action.payload.event;
      state.events = [action.payload];
    },
    transferFail: (state, action) => {
      state.transfering.transferInProgress = false;
      state.transfering.transferSuccessful = false;
      state.transfering.transferType = action.type;
      state.transfering.isError = true;
    },
    // Buy Orders
    buyOrderRequest: (state, action) => {
      state.buying.buyOrderInProgress = true;
      state.buying.buyOrderSuccessful = false;
      state.buying.transactionType = action.type;
    },
    buyOrderSuccess: (state, action) => {
      state.buying.buyOrderInProgress = false;
      state.buying.buyOrderSuccessful = true;
      state.buying.transactionType = action.type;
      state.allOrders = [action.payload.args];
      state.events = action.payload;
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
      state.allOrders = [action.payload.args];
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
  ordersLoaded,
  transferRequest,
  transferSuccess,
  transferFail,
  buyOrderRequest,
  buyOrderSuccess,
  buyOrderFail,
  sellOrderRequest,
  sellOrderSuccess,
  sellOrderFail,
} = exchange.actions;

export default exchange.reducer;
