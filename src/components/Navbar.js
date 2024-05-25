import { useSelector, useDispatch } from "react-redux";
import Blockies from "react-blockies";
import gstn_logo from "../assets/gstn_logo.png";
import eth from "../assets/eth.svg";
import config from "../config.json";

import { loadAccount } from "../store/interactions";

const Navbar = () => {
  const provider = useSelector((state) => state.provider.connection);
  const chainId = useSelector((state) => state.provider.chainId);
  const account = useSelector((state) => state.provider.account);
  const balance = useSelector((state) => state.provider.balance);

  const dispatch = useDispatch();

  const connectHandler = async () => {
    const account = await loadAccount(provider, dispatch);
  };

  const networkHandler = async (e) => {
    //Requests Metamask to switch to selected network
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: e.target.value }],
    });
  };
  return (
    <div className="exchange__header grid">
      <div className="exchange__header--brand flex">
        <img src={gstn_logo} className="logo" alt="Gaston Logo"></img>
        <h1> Gaston Token Exchange</h1>
      </div>

      <div className="exchange__header--networks flex">
        <img src={eth} className={"Eth Logo"} alt={"Eth Logo"}></img>
        {chainId && (
          <select
            name="networks"
            id="networks"
            value={config[chainId] ? `0x${chainId.toString(16)}` : `0`}
            onChange={networkHandler}
          >
            <option value="0" disabled>
              Select Network
            </option>
            <option value="0x7A69">Localhost</option>
            <option value="0xaa36a7">Sepolia</option>
          </select>
        )}
      </div>

      <div className="exchange__header--account flex">
        {balance ? (
          <p>
            <small>ETH Balance</small>
            {Number(balance).toFixed(4)}
          </p>
        ) : (
          <p>
            <small>0 ETH</small>
          </p>
        )}
        {account ? (
          <a
            href={
              config[chainId]
                ? `${config[chainId].exlorerURL}/address/${account}`
                : "#"
            }
            target="_blank"
            rel="noreferrer"
          >
            {account.slice(0, 7) + "..." + account.slice(37, 42)}
            <Blockies
              seed={account}
              size={10}
              scale={3}
              colr="#2187d0"
              bgColor="#F1F2F9"
              spotColor="#767F92"
              className="identicon"
            />
          </a>
        ) : (
          <button className={"button"} onClick={connectHandler}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
