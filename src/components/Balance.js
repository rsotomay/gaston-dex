import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import gstn_logo from "../assets/gstn_logo.png";
import { loadBalances, depositTokens } from "../store/interactions";

const Balance = () => {
  const [token1DepositAmount, setToken1DepositAmount] = useState(0);

  const provider = useSelector((state) => state.provider.connection);
  const symbols = useSelector((state) => state.tokens.symbols);
  const exchange = useSelector((state) => state.exchange.contract);
  const tokens = useSelector((state) => state.tokens.contracts);
  const account = useSelector((state) => state.provider.account);
  const tokenBalances = useSelector((state) => state.tokens.balances);
  const exchangeBalances = useSelector((state) => state.exchange.balances);
  // To reload the componenet if state of isDepositing changes and it's called in useEffect's array of variables
  const depositInProgress = useSelector(
    (state) => state.exchange.depositing.depositInProgress
  );

  const dispatch = useDispatch();

  const amountHandler = (e, token) => {
    if (token.address === tokens[0].address) {
      setToken1DepositAmount(e.target.value);
    }
  };

  const depositHandler = (e, token) => {
    e.preventDefault();
    if (token.address === tokens[0].address) {
      depositTokens(
        provider,
        exchange,
        "Deposit",
        token,
        token1DepositAmount,
        dispatch
      );
      setToken1DepositAmount(0);
    }
  };

  useEffect(() => {
    if (exchange && tokens[0] && tokens[1] && account) {
      loadBalances(exchange, tokens, account, dispatch);
    }
  }, [exchange, tokens, account, dispatch, depositInProgress]);

  return (
    <div className="component exchange__transfers">
      <div className="component__header flex-between">
        <h2>Balance</h2>
        <div className="tabs">
          <button className="tab tab--active">Deposit</button>
          <button className="tab">Withdraw</button>
        </div>
      </div>

      {/* Deposit/Withdraw Component 1 (DApp) */}

      <div className="exchange__transfers--form">
        <div className="flex-between">
          <p>
            <small>Token</small>
            <br />
            <img src={gstn_logo} className="logo3" alt="TokenLogo" />
            {symbols[0]}
          </p>
          <p>
            <small>Wallet</small>
            <br />
            {tokenBalances && tokenBalances[0]}
          </p>
          <p>
            <small>Exchange</small>
            <br />
            {exchangeBalances && exchangeBalances[0]}
          </p>
        </div>

        <form onSubmit={(e) => depositHandler(e, tokens[0])}>
          <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
          <input
            type="text"
            id="token0"
            placeholder="0.0000"
            value={token1DepositAmount === 0 ? "" : token1DepositAmount}
            onChange={(e) => amountHandler(e, tokens[0])}
          />

          <button className="button" type="submit">
            <span>Deposit</span>
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (mETH) */}

      <div className="exchange__transfers--form">
        <div className="flex-between"></div>

        <form>
          <label htmlFor="token1"></label>
          <input type="text" id="token1" placeholder="0.0000" />

          <button className="button" type="submit">
            <span></span>
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
};

export default Balance;
