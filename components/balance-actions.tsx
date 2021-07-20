import clsx from "clsx";
import { useState } from "react";
import BalanceActionsHandlers from "./balance-actions-handlers";
import { NumberFormatValues } from "react-number-format";
import BalanceActionsSuccess from "./balance-actions-success";
import InputNumber from "./input-number";
import ApproveSettlerToken from "./approve-settler-token";

const actions: string[] = ["Lock", "Unlock"];

function BalanceActions(): JSX.Element {
  const [action, setAction] = useState<string>(actions[0]);
  const [amount, setAmount] = useState<number>(0);
  const [success, setSuccess] = useState<boolean>(false);
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

  function handleSuccessAction() {
    handleCloseAction();
    setSuccess(true);
  }
  function handleAction(params: string) {
    setAction(params);
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
        <InputNumber
          label="$BEPRO Amount"
          symbol="$BEPRO"
          value={amount}
          onValueChange={(values: NumberFormatValues) =>
            setAmount(values.floatValue)
          }
        />
        <ApproveSettlerToken
          amount={amount}
          fallback={
            <BalanceActionsHandlers
              onCloseAction={handleCloseAction}
              onSuccessAction={handleSuccessAction}
              disabled={!amount}
              info={info}
            />
          }
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
