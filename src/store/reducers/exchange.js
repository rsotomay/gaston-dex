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
    ordering: {
      orderInProgress: false,
      orderSuccessful: false,
      transactionType: null,
    },
    cancelling: {
      cancelInProgress: false,
      cancelSuccessful: false,
      transactionType: null,
    },
    filling: {
      fillInProgress: false,
      fillSuccessful: false,
      transactionType: null,
    },
    cancelledOrders: {
      loaded: false,
      data: [],
    },
    filledOrders: {
      loaded: false,
      data: [],
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
    //Cancelled Orders
    cancelledOrdersLoaded: (state, action) => {
      state.cancelledOrders.loaded = true;
      state.cancelledOrders.data = action.payload;
    },
    //Filled Orders
    filledOrdersLoaded: (state, action) => {
      state.filledOrders.loaded = true;
      state.filledOrders.data = action.payload;
    },
    // Orders
    ordersLoaded: (state, action) => {
      state.allOrders.loaded = true;
      state.allOrders.data = action.payload;
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
      state.events = [action.payload, ...state.events];
    },
    transferFail: (state, action) => {
      state.transfering.transferInProgress = false;
      state.transfering.transferSuccessful = false;
      state.transfering.transferType = action.type;
      state.transfering.isError = true;
    },
    // Buy Orders
    orderRequest: (state, action) => {
      state.ordering.orderInProgress = true;
      state.ordering.orderSuccessful = false;
      state.ordering.transactionType = action.type;
    },
    orderSuccess: (state, action) => {
      //Prevents duplicate order id's
      let index = state.allOrders.data.findIndex(
        (order) => order.id.toString() === action.payload.id.toString()
      );
      let data;
      if (index === -1) {
        data = [...state.allOrders.data, action.payload];
      } else {
        data = state.allOrders.data;
      }
      state.ordering.orderInProgress = false;
      state.ordering.orderSuccessful = true;
      state.ordering.transactionType = action.type;
      state.events = [action.payload, ...state.events];
      state.allOrders.data = data;
    },
    orderFail: (state, action) => {
      state.ordering.orderInProgress = false;
      state.ordering.orderSuccessful = false;
      state.ordering.transactionType = action.type;
      state.ordering.isError = true;
    },
    // Cancelling
    cancelRequest: (state, action) => {
      state.cancelling.cancelInProgress = true;
      state.cancelling.cancelSuccessful = false;
      state.cancelling.transactionType = action.type;
    },
    cancelSuccess: (state, action) => {
      state.cancelling.cancelInProgress = false;
      state.cancelling.cancelSuccessful = true;
      state.cancelling.transactionType = action.type;
      state.cancelledOrders.data = [
        ...state.cancelledOrders.data,
        action.payload,
      ];
      state.events = [action.payload, ...state.events];
    },
    cancelFail: (state, action) => {
      state.cancelling.cancelInProgress = false;
      state.cancelling.cancelSuccessful = false;
      state.cancelling.transactionType = action.type;
      state.cancelling.isError = true;
    },
    // Filling
    fillRequest: (state, action) => {
      state.filling.fillInProgress = true;
      state.filling.fillSuccessful = false;
      state.filling.transactionType = action.type;
    },
    fillSuccess: (state, action) => {
      //Prevents duplicate order id's
      let index = state.filledOrders.data.findIndex(
        (order) => order.id.toString() === action.payload.id.toString()
      );
      let data;
      if (index === -1) {
        data = [...state.filledOrders.data, action.payload];
      } else {
        data = state.filledOrders.data;
      }
      state.filling.fillInProgress = false;
      state.filling.fillSuccessful = true;
      state.filling.transactionType = action.type;
      state.filledOrders.data = data;
      state.events = [action.payload, ...state.events];
    },
    fillFail: (state, action) => {
      state.filling.fillInProgress = false;
      state.filling.fillSuccessful = false;
      state.filling.transactionType = action.type;
      state.filling.isError = true;
    },
  },
});

export const {
  setExchange,
  exchangeBalancesLoaded,
  cancelledOrdersLoaded,
  filledOrdersLoaded,
  ordersLoaded,
  transferRequest,
  transferSuccess,
  transferFail,
  orderRequest,
  orderSuccess,
  orderFail,
  cancelRequest,
  cancelSuccess,
  cancelFail,
  fillRequest,
  fillSuccess,
  fillFail,
} = exchange.actions;

export default exchange.reducer;
