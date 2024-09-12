import { ethers } from "ethers";
import TOKEN_ABI from "../abis/Token.json";
import EXCHANGE_ABI from "../abis/Exchange.json";
import config from "../config.json";

import {
  setProvider,
  setNetwork,
  setAccount,
  setBalance,
} from "./reducers/provider";
import {
  tokenBalancesLoaded,
  setContracts,
  setSymbols,
} from "./reducers/tokens";
import {
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
} from "./reducers/exchange";

export const loadProvider = (dispatch) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  dispatch(setProvider(provider));

  return provider;
};

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork();
  dispatch(setNetwork(chainId));

  return chainId;
};

export const loadAccount = async (provider, dispatch) => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = ethers.utils.getAddress(accounts[0]);
  dispatch(setAccount(account));

  let balance = await provider.getBalance(account);
  balance = ethers.utils.formatEther(balance);
  dispatch(setBalance(balance));

  return account;
};

export const loadTokens = async (provider, addresses, dispatch) => {
  try {
    // Loading Tokens
    const gstn = new ethers.Contract(addresses[0], TOKEN_ABI, provider);

    const mETH = new ethers.Contract(addresses[1], TOKEN_ABI, provider);

    if (!gstn || !mETH) {
      throw new Error("Failed to get token contracts");
    }

    dispatch(setContracts([gstn, mETH]));
    dispatch(setSymbols([await gstn.symbol(), await mETH.symbol()]));
  } catch (error) {
    console.error("Failed to load tokens:", error);
    throw error;
  }
};

export const loadExchange = async (provider, chainId, dispatch) => {
  const exchange = new ethers.Contract(
    config[chainId].exchange.address,
    EXCHANGE_ABI,
    provider
  );
  dispatch(setExchange(exchange));

  return exchange;
};

export const subscribeToEvents = (exchange, dispatch) => {
  exchange.on("Deposit", (token, user, amount, balance, event) => {
    dispatch(transferSuccess(event));
  });

  exchange.on("Withdrawal", (token, user, amount, balance, event) => {
    dispatch(transferSuccess(event));
  });

  exchange.on(
    "Order",
    (
      id,
      user,
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      timestamp,
      event
    ) => {
      const order = event.args;
      dispatch(orderSuccess(order, event));
    }
  );

  exchange.on(
    "Cancel",
    (
      id,
      user,
      tokenGet,
      amountGet,
      tokenGive,
      amountGive,
      timestamp,
      event
    ) => {
      const order = event.args;
      dispatch(cancelSuccess(order, event));
    }
  );
};
export const loadBalances = async (exchange, tokens, account, dispatch) => {
  try {
    const token_1_Balance = await tokens[0].balanceOf(account);
    const token_2_Balance = await tokens[1].balanceOf(account);

    const exchangeToken_1_Balance = await exchange.exchangeBalanceOf(
      tokens[0].address,
      account
    );
    const exchangeToken_2_Balance = await exchange.exchangeBalanceOf(
      tokens[1].address,
      account
    );

    dispatch(
      tokenBalancesLoaded([
        ethers.utils.formatUnits(token_1_Balance, 18),
        ethers.utils.formatUnits(token_2_Balance, 18),
      ])
    );
    dispatch(
      exchangeBalancesLoaded([
        ethers.utils.formatUnits(exchangeToken_1_Balance, 18),
        ethers.utils.formatUnits(exchangeToken_2_Balance, 18),
      ])
    );
  } catch (error) {
    console.error("Failed to load balance:", error);
    throw error;
  }
};

export const loadAllOrders = async (provider, exchange, dispatch) => {
  const block = await provider.getBlockNumber();

  //Fetch calcelled orders
  const cancelStream = await exchange.queryFilter("Cancel", 0, block);
  const cancelledOrders = cancelStream.map((event) => event.args);

  dispatch(cancelledOrdersLoaded(cancelledOrders));

  //Fetch filled orders
  const fillStream = await exchange.queryFilter("Trade", 0, block);
  const filledOrders = fillStream.map((event) => event.args);

  dispatch(filledOrdersLoaded(filledOrders));

  //Fetch all orders
  const orderStream = await exchange.queryFilter("Order", 0, block);
  const allOrders = orderStream.map((event) => event.args);

  dispatch(ordersLoaded(allOrders));
};

export const transferTokens = async (
  provider,
  exchange,
  transferType,
  token,
  amount,
  dispatch
) => {
  try {
    const signer = await provider.getSigner();
    const amountToTransfer = ethers.utils.parseUnits(amount.toString(), 18);
    let transaction;
    if (transferType === "Deposit") {
      dispatch(transferRequest());
      transaction = await token
        .connect(signer)
        .approve(exchange.address, amountToTransfer);
      await transaction.wait();
      transaction = await exchange
        .connect(signer)
        .depositToken(token.address, amountToTransfer);
      await transaction.wait();
    } else {
      dispatch(transferRequest());
      transaction = await exchange
        .connect(signer)
        .withdrawToken(token.address, amountToTransfer);
      await transaction.wait();
    }
  } catch (error) {
    dispatch(transferFail());
  }
};

export const makeBuyOrder = async (
  provider,
  exchange,
  tokens,
  order,
  dispatch
) => {
  const tokenGet = tokens[0].address;
  const amountGet = ethers.utils.parseUnits(order.amount.toString(), 18);
  const tokenGive = tokens[1].address;
  const amountGive = ethers.utils.parseUnits(
    (order.amount * order.price).toString(),
    18
  );
  dispatch(orderRequest());

  try {
    const signer = await provider.getSigner();
    const transaction = await exchange
      .connect(signer)
      .makeOrder(tokenGet, amountGet, tokenGive, amountGive);
    await transaction.wait();
  } catch (error) {
    dispatch(orderFail());
  }
};

export const makeSellOrder = async (
  provider,
  exchange,
  tokens,
  order,
  dispatch
) => {
  const tokenGet = tokens[1].address;
  const amountGet = ethers.utils.parseUnits(
    (order.amount * order.price).toString(),
    18
  );
  const tokenGive = tokens[0].address;
  const amountGive = ethers.utils.parseUnits(order.amount.toString(), 18);
  dispatch(orderRequest());

  try {
    const signer = await provider.getSigner();
    const transaction = await exchange
      .connect(signer)
      .makeOrder(tokenGet, amountGet, tokenGive, amountGive);
    await transaction.wait();
  } catch (error) {
    dispatch(orderFail());
  }
};

export const cancelOrder = async (provider, exchange, order, dispatch) => {
  dispatch(cancelRequest());

  try {
    const signer = await provider.getSigner();
    const transaction = await exchange.connect(signer).cancelOrder(order.id);
    await transaction.wait();
  } catch (error) {
    dispatch(cancelFail());
  }
};
