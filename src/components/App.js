import { useEffect } from "react";
import { useDispatch } from "react-redux";
import config from "../config.json";

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
  loadAllOrders,
  loadEvents,
  subscribeToEvents,
} from "../store/interactions";

import Navbar from "./Navbar.js";
import Markets from "./Markets.js";
import Balance from "./Balance.js";
import Order from "./Order.js";
import PriceChart from "./PriceChart.js";
import Transactions from "./Transactions.js";
import Trades from "./Trades.js";
import OrderBook from "./OrderBook.js";
import Alert from "./Alert.js";

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    // Connect Ethers to blockchain
    const provider = loadProvider(dispatch);
    // Fetch current network chainId
    const chainId = await loadNetwork(provider, dispatch);
    //Reload page when network changes
    window.ethereum.on("chainChanged", () => {
      window.location.reload();
    });
    //Fetch current account and balance from Metamask when account changes
    window.ethereum.on("accountsChanged", () => {
      loadAccount(provider, dispatch);
    });
    // // Load token smart contract
    const gstn = config[chainId].gstn;
    const mETH = config[chainId].mETH;
    await loadTokens(provider, [gstn.address, mETH.address], dispatch);
    // // Load exchange contract
    const exchange = await loadExchange(provider, chainId, dispatch);
    //Fetch all orders
    loadAllOrders(provider, exchange, dispatch);
    // Fetch all events
    loadEvents(provider, exchange, dispatch);
    //Listen to events
    subscribeToEvents(exchange, dispatch);
  };

  useEffect(() => {
    loadBlockchainData();
  });

  return (
    <div>
      <Navbar />

      <main className="exchange grid">
        <section className="exchange__section--left grid">
          <Markets />

          <Balance />

          <Order />
        </section>
        <section className="exchange__section--right grid">
          <PriceChart />

          <Transactions />

          <Trades />

          <OrderBook />
        </section>
      </main>

      <Alert />
    </div>
  );
}

export default App;
