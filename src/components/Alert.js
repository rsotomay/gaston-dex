import { useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { myEventsSelector } from "../store/selectors";
import config from "../config.json";

const Alert = () => {
  const alertRef = useRef(null);
  const chainId = useSelector((state) => state.provider.chainId);
  const account = useSelector((state) => state.provider.account);
  const isTransferPending = useSelector(
    (state) => state.exchange.transfering.transferInProgress
  );
  const isTransferError = useSelector(
    (state) => state.exchange.transfering.isError
  );
  const isOrderPending = useSelector(
    (state) => state.exchange.ordering.orderInProgress
  );
  const isOrderError = useSelector((state) => state.exchange.ordering.isError);
  const isCancelPending = useSelector(
    (state) => state.exchange.cancelling.cancelInProgress
  );
  const isCancelError = useSelector(
    (state) => state.exchange.cancelling.isError
  );
  const isFillPending = useSelector(
    (state) => state.exchange.filling.fillInProgress
  );
  const isFillError = useSelector((state) => state.exchange.filling.isError);

  const events = useSelector(myEventsSelector);

  const removeHandler = async (e) => {
    alertRef.current.className = "alert--remove";
  };

  useEffect(() => {
    if (
      (isTransferPending ||
        isOrderPending ||
        isTransferError ||
        isOrderError ||
        isCancelPending ||
        isCancelError ||
        isFillPending ||
        isFillError) &&
      account
    ) {
      alertRef.current.className = "alert";
    }
  }, [
    events,
    isTransferPending,
    isOrderPending,
    isTransferError,
    isOrderError,
    isCancelPending,
    isCancelError,
    isFillPending,
    isFillError,
    account,
  ]);

  return (
    <div>
      {isTransferPending ||
      isOrderPending ||
      isCancelPending ||
      isFillPending ? (
        <div
          className="alert alert--remove"
          onClick={removeHandler}
          ref={alertRef}
        >
          <h1>Transaction Pending...</h1>
        </div>
      ) : isTransferError || isOrderError || isCancelError || isFillError ? (
        <div
          className="alert alert--remove"
          onClick={removeHandler}
          ref={alertRef}
        >
          <h1>Transaction Will Fail</h1>
        </div>
      ) : !isTransferPending && events && events[0] ? (
        <div
          className="alert alert--remove"
          onClick={removeHandler}
          ref={alertRef}
        >
          <h1>Transfer Successful</h1>
          <a
            href={
              config[chainId]
                ? `${config[chainId].explorerURL}/tx/${events[0].transactionHash}`
                : "#"
            }
            target="_blank"
            rel="noreferrer"
          >
            {events[0].transactionHash.slice(0, 6) +
              "..." +
              events[0].transactionHash.slice(60, 66)}
          </a>
        </div>
      ) : !isOrderPending || !isCancelPending || !isFillPending ? (
        <div
          className="alert alert--remove"
          onClick={removeHandler}
          ref={alertRef}
        >
          <h1>Transaction Successful</h1>
        </div>
      ) : (
        <div
          className="alert alert--remove"
          onClick={removeHandler}
          ref={alertRef}
        ></div>
      )}
    </div>
  );
};

export default Alert;
