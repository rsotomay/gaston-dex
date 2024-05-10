import { configureStore } from "@reduxjs/toolkit";

import provider from "./reducers/provider";
import tokens from "./reducers/tokens";
import exchange from "./reducers/exchange";

export const store = configureStore({
  reducer: {
    provider,
    tokens,
    exchange,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

// import { legacy_createStore, combineReducers, applyMiddleware } from "redux";
// import thunk from "redux-thunk";
// import { composeWithDevTools } from "redux-devtools-extension";

// /* Import Reducers */
// import { provider, tokens, exchange } from "./reducers";

// const reducer = combineReducers({
//   provider,
//   tokens,
//   exchange,
// });

// const initialState = {};

// const middleware = [thunk];

// const store = legacy_createStore(
//   reducer,
//   initialState,
//   composeWithDevTools(applyMiddleware(...middleware))
// );

// export default store;
