import { useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
} from "../store/interactions";

import Navbar from "./Navbar.js";

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
    await loadTokens(provider, chainId, dispatch);
    // // Load exchange contract
    await loadExchange(provider, chainId, dispatch);
  };

  useEffect(() => {
    loadBlockchainData();
  });

  return (
    <div>
      <Navbar />

      <main className="exchange grid">
        <section className="exchange__section--left grid">
          {/* Markets */}

          {/* Balance */}

          {/* Order */}
        </section>
        <section className="exchange__section--right grid">
          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}
        </section>
      </main>

      {/* Alert */}
    </div>
  );
}

export default App;
