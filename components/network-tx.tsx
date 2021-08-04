import Modal from "./modal";
import useAccount, { TYPES as AccountTypes } from "hooks/useAccount";
import { setLoadingAttributes } from "providers/loading-provider";
import { ComponentPropsWithRef, forwardRef, useState } from "react";
import BeproService from "services/bepro";
import Icon from "./icon";
import clsx from "clsx";

interface Props extends ComponentPropsWithRef<"button"> {
  call: {
    id: "lock" | "unlock" | "delegateOracles" | string;
    params: {
      [key: string]: string | number;
    };
  };
  info: {
    title: string;
    description: string;
  };
  onTransaction(): void;
  onTransactionError(message: string): void;
  onClickVerification?(): void;
}

const NetworkTx = forwardRef<HTMLButtonElement, Props>(function NetworkTx(
  {
    info,
    className,
    children,
    call,
    onTransaction = () => {},
    onTransactionError = () => {},
    onClickVerification = () => {},
    ...props
  },
  ref,
): JSX.Element {
  const account = useAccount();
  const [show, setShow] = useState<boolean>(false);
  const [isSucceed, setIsSucceed] = useState<boolean>(false);

  async function handleClick() {
    onClickVerification();

    try {
      onTransaction();
      setLoadingAttributes(true);

      const transaction = await BeproService.network[call.id](
        Object.assign({}, call.params),
      );
      const oracles = await BeproService.network.getOraclesSummary({
        address: account.address,
      });

      account.dispatch({
        type: AccountTypes.SET,
        props: {
          oracles,
        },
      });
      setIsSucceed(transaction.status);
      setShow(true);
      setLoadingAttributes(false);
    } catch (error) {
      onTransactionError(error.message);
      setLoadingAttributes(false);
    }
  }

  return (
    <>
      <button
        ref={ref}
        className={clsx(
          "btn btn-md btn-primary",
          { "visually-hidden": !children },
          className,
        )}
        onClick={handleClick}
        {...props}>
        {children}
      </button>
      <Modal
        show={show}
        title={info.title}
        footer={
          <button
            className="btn btn-md btn-opac"
            onClick={() => setShow(false)}>
            Close
          </button>
        }>
        <p className="p-small text-white-50 text-center">{info.description}</p>
        <div
          className={clsx("d-flex flex-column align-items-center", {
            "text-success": isSucceed,
            "text-danger": !isSucceed,
          })}>
          <Icon className="md-larger">
            {isSucceed ? "check_circle" : "error"}
          </Icon>
          <p className="text-center fs-4 mb-0 mt-2">
            Transaction {isSucceed ? "completed" : "failed"}
          </p>
        </div>
      </Modal>
    </>
  );
});

NetworkTx.displayName = "NetworkTx";
export default NetworkTx;
