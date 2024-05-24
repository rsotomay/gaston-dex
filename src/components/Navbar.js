import { useSelector } from "react-redux";
import Blockies from "react-blockies";
import gstn_logo from "../assets/gstn_logo.png";

const Navbar = () => {
  const account = useSelector((state) => state.provider.account);
  const balance = useSelector((state) => state.provider.balance);
  return (
    <div className="exchange__header grid">
      <div className="exchange__header--brand flex">
        <img src={gstn_logo} className="logo" alt="Gaston Logo"></img>
        <h1> Gaston Token Exchange</h1>
      </div>

      <div className="exchange__header--networks flex"></div>

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
          <a href="">
            {account.slice(0, 7) + "..." + account.slice(37, 42)}
            <Blockies
              account={account}
              size={10}
              scale={3}
              colr="#2187d0"
              bgColor="#F1F2F9"
              spotColor="#767F92"
              className="identicon"
            />
          </a>
        ) : (
          <a></a>
        )}
      </div>
    </div>
  );
};

export default Navbar;
