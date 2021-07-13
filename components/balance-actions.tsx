import clsx from "clsx";
import { useCallback, useEffect, useState } from "react";
import BalanceActionsHandlers from "./balance-actions-handlers";
import NumberFormat, { NumberFormatValues } from "react-number-format";
import BalanceActionsSuccess from "./balance-actions-success";
import BeproService from "../services/bepro";
import { InferGetStaticPropsType } from "next";

const actions: string[] = ["Lock", "Unlock"];

export async function getStaticProps() {
  await BeproService.login();
  const address: string = await BeproService.getAddress();

  return {
    props: {
      address,
    },
  };
}

function BalanceActions({
  address,
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element {
  const [action, setAction] = useState<string>(actions[0]);
  const [amount, setAmount] = useState<number>(0);
  const [success, setSuccess] = useState<boolean>(false);
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const renderAmount = amount ? `${amount} ` : "";
  const info = {
    Lock: {
      title: "Lock $BEPRO",
      description: "Lock $BEPRO to get oracles",
      label: `Get ${renderAmount}oracles`,
      caption: "Get Oracles from $BEPRO",
      body: `You are locking ${amount} $BEPRO /br/ to get /oracles${amount} Oracles/`,
    },
    Unlock: {
      title: "Unlock $BEPRO",
      description: "Unlock $BEPRO by giving away oracles",
      label: `Recover ${renderAmount}$BEPRO`,
      caption: "Get $BEPRO from Oracles",
      body: `Give away /oracles${amount} Oracles/ /br/ to get back ${amount} $BEPRO`,
    },
  }[action];
  const handleApprovedCallback = useCallback(async () => {
    try {
      const isApprovedSettlerToken =
        await BeproService.network.isApprovedSettlerToken({
          address,
          amount,
        });
      setIsApproved(isApprovedSettlerToken);
    } catch (error) {
      console.log("Error", error);
    }
  }, [address, amount]);

  console.log({ isApproved });

  useEffect(() => {
    handleApprovedCallback();
  }, [handleApprovedCallback]);
  function handleSuccessAction() {
    handleCloseAction();
    setSuccess(true);
  }
  function handleAction(params: string) {
    handleCloseAction();
    setAction(params);
  }
  function handleChange(values: NumberFormatValues) {
    setAmount(values.floatValue);
  }
  function handleCloseAction() {
    setAmount(0);
  }

  return (
    <>
      <div className="content-wrapper">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex">
            {actions.map((actionItem) => (
              <button
                key={actionItem}
                onClick={() => handleAction(actionItem)}
                className={clsx("btn p-0 subnav-item", {
                  active: actionItem === action,
                })}>
                <h4 className="h4 mb-0 mr-2">{actionItem}</h4>
              </button>
            ))}
          </div>
          <span className="badge-opac">200 Available</span>
        </div>
        <p className="p text-white">{info.description}</p>
        <div className="form-group">
          <label className="p-small mb-2">$BEPRO Amount</label>
          <div className="input-group mb-4">
            <NumberFormat
              min="0"
              className="form-control"
              placeholder="0"
              value={amount}
              thousandSeparator={true}
              onValueChange={handleChange}
            />
            <span className="input-group-text text-white-50 p-small">
              $BEPRO
            </span>
          </div>
        </div>
        {!isApproved && (
          <button
            className="btn btn-md btn-lg btn-opac w-100 mb-4"
            onClick={handleApprovedCallback}>
            Approve
          </button>
        )}
        <BalanceActionsHandlers
          onCloseAction={handleCloseAction}
          onSuccessAction={handleSuccessAction}
          disabled={!amount}
          info={info}
        />
      </div>
      <BalanceActionsSuccess
        info={{ title: info.title, description: info.description }}
        show={success}
        onClose={() => setSuccess(false)}
      />
    </>
  );
}

export default BalanceActions;
