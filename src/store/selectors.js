import { createSelector } from "reselect";
import { get, groupBy, reject, maxBy, minBy } from "lodash";
import moment from "moment";
import { ethers } from "ethers";

const GREEN = "#25CE8F";
const RED = "#F45353";

const account = (state) => get(state, "provider.account");
const tokens = (state) => get(state, "tokens.contracts");
const events = (state) => get(state, "exchange.events", []);
const allOrders = (state) => get(state, "exchange.allOrders.data", []);
const filledOrders = (state) => get(state, "exchange.filledOrders.data", []);
const cancelledOrders = (state) =>
  get(state, "exchange.cancelledOrders.data", []);

const openOrders = (state) => {
  const all = allOrders(state);
  const filled = filledOrders(state);
  const cancelled = cancelledOrders(state);
  //Remove (reject) filled and cancelled orders and returns only open orders
  const openOrders = reject(all, (order) => {
    const orderFilled = filled.some(
      (o) => o.id.toString() === order.id.toString()
    );
    const orderCancelled = cancelled.some(
      (o) => o.id.toString() === order.id.toString()
    );

    return orderFilled || orderCancelled;
  });
  return openOrders;
};

// ----------------------------------------------------------------------------------------
//My Events
export const myEventsSelector = createSelector(
  account,
  events,
  (account, events) => {
    if (!account || !events[0] || !events[0].transactionHash) {
      return;
    }
    //Filter events that belong to current account
    events = events.filter((e) => e.args.user === account);
    return events;
  }
);

// ----------------------------------------------------------------------------------------
//My open orders

export const myOpenOrdersSelector = createSelector(
  account,
  tokens,
  openOrders,
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) {
      return;
    }

    //Filter orders created by current account
    orders = orders.filter((o) => o.user === account);

    //Filter orders by selected tokens
    orders = orders.filter(
      (o) =>
        o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address
    );

    //Decorate orders - add display attributes
    orders = decorateMyOpenOrders(orders, tokens);

    // Sort orders by date descending to compare hostory
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);

    return orders;
  }
);

const decorateMyOpenOrders = (orders, tokens) => {
  return orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateMyOpenOrder(order, tokens);
    return order;
  });
};

const decorateMyOpenOrder = (order, tokens) => {
  let orderType = order.tokenGive === tokens[1].address ? "buy" : "sell";

  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? GREEN : RED,
    orderFillAction: orderType === "buy" ? "sell" : "buy",
  };
};

const decorateOrder = (order, tokens) => {
  let token0Amount, token1Amount;

  //Note: GSTN should be consider token0, mETH is consider token1
  //Example: Giving mETH in exchange for GSTN
  if (order.tokenGive === tokens[1].address) {
    token0Amount = order.amountGive; // The amount of GSTN we are giving
    token1Amount = order.amountGet; // The amount of mETH we want...
  } else {
    token0Amount = order.amountGet; // The amount of GSTN we want
    token1Amount = order.amountGive; // The amount of mETH we are giving..
  }

  //Calculate token price to 5 decimal places
  const precision = 100000;
  let tokenPrice = token1Amount / token0Amount;
  tokenPrice = Math.round(tokenPrice * precision) / precision;

  return {
    ...order,
    token0Amount: ethers.utils.formatUnits(token0Amount),
    token1Amount: ethers.utils.formatUnits(token1Amount),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format("h:mm:ssa d MMM D"),
  };
};

// ----------------------------------------------------------------------------------------
//All Filled Orders

export const filledOrdersSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) {
      return;
    }

    //Filter orders by selected tokens
    orders = orders.filter(
      (o) =>
        o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address
    );
    // Sort orders by date ascending to compare hostory
    orders = orders.sort((a, b) => a.timestamp - b.timestamp);
    // Decorate orders - add display atrubutes
    orders = decorateFilledOrders(orders, tokens);
    // Sort orders by date descending to compare hostory
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);

    return orders;
  }
);

const decorateFilledOrders = (orders, tokens) => {
  //Track previous order to compare history
  let previousOrder = orders[0];

  return orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateFilledOrder(order, previousOrder);
    previousOrder = order; // updates previousOrder
    return order;
  });
};

const decorateFilledOrder = (order, previousOrder) => {
  return {
    ...order,
    tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder),
  };
};

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
  if (previousOrder.id === orderId) {
    return GREEN;
  }

  if (previousOrder.tokenPrice <= tokenPrice) {
    return GREEN;
  } else {
    return RED;
  }
};

// ----------------------------------------------------------------------------------------
//My filled orders

export const myFilledOrdersSelector = createSelector(
  account,
  tokens,
  filledOrders,
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) {
      return;
    }

    //Filter orders created or filled by current account
    orders = orders.filter((o) => o.user === account || o.creator === account);

    //Filter orders by selected tokens
    orders = orders.filter(
      (o) =>
        o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address
    );

    // Sort orders by date descending to compare hostory
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);

    //Decorate orders - add display attributes
    orders = decorateMyFilledOrders(orders, account, tokens);

    return orders;
  }
);

const decorateMyFilledOrders = (orders, account, tokens) => {
  return orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateMyFilledOrder(order, account, tokens);
    return order;
  });
};

const decorateMyFilledOrder = (order, account, tokens) => {
  const myOrder = order.creator === account;

  let orderType;

  if (myOrder) {
    orderType = order.tokenGive === tokens[1].address ? "buy" : "sell";
  } else {
    orderType = order.tokenGive === tokens[1].address ? "sell" : "buy";
  }

  return {
    ...order,
    orderType,
    orderClass: orderType === "buy" ? GREEN : RED,
    orderSign: orderType === "buy" ? "+" : "-",
  };
};

// ----------------------------------------------------------------------------------------
//Order Book

export const orderBookSelector = createSelector(
  openOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) {
      return;
    }
    //Filter orders by selected tokens
    orders = orders.filter(
      (o) =>
        o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address
    );
    //Decorate Orders
    orders = decorateOrderBookOrders(orders, tokens);

    //Group orders in separate arrays by 'orderType' buy and sell
    orders = groupBy(orders, "orderType");

    //Fetch buy orders first in order to sort them. (with an empty array in case no orders)
    const buyOrders = get(orders, "buy", []);

    //Sort buy orders by token price
    orders = {
      ...orders,
      buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
    };

    //Fetch sell orders first in order to sort them. (with an empty array in case no orders)
    const sellOrders = get(orders, "sell", []);

    //Sort sell orders by token price
    orders = {
      ...orders,
      sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
    };
    return orders;
  }
);

const decorateOrderBookOrders = (orders, tokens) => {
  return orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateOrderBookOrder(order, tokens);
    return order;
  });
};

const decorateOrderBookOrder = (order, tokens) => {
  const orderType = order.tokenGive === tokens[1].address ? "buy" : "sell";

  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? GREEN : RED,
    orderFillAction: orderType === "buy" ? "sell" : "buy",
  };
};

// ----------------------------------------------------------------------------------------
//Price Chart

export const priceChartSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) {
      return;
    }

    //Filter orders by selected tokens
    orders = orders.filter(
      (o) =>
        o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address
    );

    // Sort orders by date ascending to compare hostory
    orders = orders.sort((a, b) => a.timestamp - b.timestamp);
    // Decorate orders - add display atrubutes
    orders = orders.map((o) => decorateOrder(o, tokens));

    let secondLastOrder, lastOrder;
    //Get last 2 traded order for final price & price change
    [secondLastOrder, lastOrder] = orders.slice(
      orders.length - 2,
      orders.length
    );
    //Get price of last traded order with lodash get()
    const lastPrice = get(lastOrder, "tokenPrice", 0);
    //Get price of second last traded order with lodash get()
    const secondLastPrice = get(secondLastOrder, "tokenPrice", 0);

    return {
      lastPrice,
      lastPriceChange: lastPrice >= secondLastPrice ? "+" : "-",
      series: [
        {
          data: buildGraphData(orders),
        },
      ],
    };
  }
);

const buildGraphData = (orders) => {
  // Groups orders by hour
  orders = groupBy(orders, (o) =>
    moment.unix(o.timestamp).startOf("hour").format()
  );

  //Get each hour where data exists
  const hours = Object.keys(orders);
  //Build the graph series
  const graphData = hours.map((hour) => {
    //Fetch all orders from current hour
    const group = orders[hour];
    // calculate price values: open, high, low, close
    const open = group[0]; //first order
    // Returns the maximum value inside the array (highest token price)
    const high = maxBy(group, "tokenPrice"); // highrst price
    // Returns the minimum value inside the array (lowest token price)
    const low = minBy(group, "tokenPrice"); // lowest price
    const close = group[group.length - 1]; // last order

    return {
      x: new Date(hour),
      y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice],
    };
  });
  return graphData;
};
