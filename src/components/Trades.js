import { useSelector } from "react-redux";
//Import from Assets
import sort from "../assets/sort.svg";
//Import Selectors
import { filledOrdersSelector } from "../store/selectors";

import Banner from "./Banner";

const Trades = () => {
  const filledOrders = useSelector(filledOrdersSelector);
  const symbols = useSelector((state) => state.tokens.symbols);

  return (
    <div className="component exchange__trades">
      <div className="component__header flex-between">
        <h2>Trades</h2>
      </div>
      {!filledOrders || filledOrders.length === 0 ? (
        <Banner text={"No Transactions"} />
      ) : (
        <table>
          <thead>
            <tr>
              <th>
                Time
                <img src={sort} alt="Sort" />
              </th>
              <th>
                {symbols && symbols[0]}
                <img src={sort} alt="Sort" />
              </th>
              <th>
                {symbols && symbols[0]}/{symbols && symbols[1]}
                <img src={sort} alt="Sort" />
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Mapping Orders... */}
            {filledOrders &&
              filledOrders.map((order, index) => {
                return (
                  <tr key={index}>
                    <td>{order.formattedTimestamp}</td>
                    <td style={{ color: `${order.tokenPriceClass}` }}>
                      {order.token0Amount}
                    </td>
                    <td>{order.tokenPrice}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Trades;
