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
      state.events = action.payload;
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
      let index = state.allOrders.data.findIndex(
        (order) => order.id.toString() === action.order.id.toString()
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
      state.events = action.payload;
      state.allOrders.data = data;
    },
    orderFail: (state, action) => {
      state.ordering.orderInProgress = false;
      state.ordering.orderSuccessful = false;
      state.ordering.transactionType = action.type;
      state.ordering.isError = true;
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
} = exchange.actions;

export default exchange.reducer;
