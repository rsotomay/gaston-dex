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
import { setContracts, setSymbols } from "./reducers/tokens";
import { setExchange } from "./reducers/exchange";

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

// export const loadProvider = (dispatch) => {
//   const connection = new ethers.providers.Web3Provider(window.ethereum);
//   dispatch({ type: "PROVIDER_LOADED", connection });

//   return connection;
// };

// export const loadNetwork = async (provider, dispatch) => {
//   const { chainId } = await provider.getNetwork();
//   dispatch({ type: "NETWORK_LOADED", chainId });

//   return chainId;
// };

// export const loadAccount = async (dispatch) => {
//   const accounts = await window.ethereum.request({
//     method: "eth_requestAccounts",
//   });
//   const account = ethers.utils.getAddress(accounts[0]);
//   dispatch({ type: "ACCOUNT_LOADED", account });

//   return account;
// };

// export const loadTokens = async (provider, addresses, dispatch) => {
//   let token, symbol;
//   token = new ethers.Contract(addresses[0], TOKEN_ABI, provider);
//   symbol = await token.symbol();
//   dispatch({ type: "TOKEN_1_LOADED", token, symbol });

//   token = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
//   symbol = await token.symbol();
//   dispatch({ type: "TOKEN_2_LOADED", token, symbol });

//   return token;
// };

// export const loadExchange = async (provider, address, dispatch) => {
//   const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
//   dispatch({ type: "EXCHANGE_LOADED", exchange });

//   return exchange;
// };
