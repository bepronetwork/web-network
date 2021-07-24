import clsx from "clsx";
import { useEffect, useState } from "react";
import BalanceActionsHandlers from "./balance-actions-handlers";
import { NumberFormatValues } from "react-number-format";
import BalanceActionsStatus from "./balance-actions-status";
import InputNumber from "./input-number";
import ApproveSettlerToken from "./approve-settler-token";
import BeproService from "../services/bepro";
import { setLoadingAttributes } from "../providers/loading-provider";

const actions: string[] = ["Lock", "Unlock"];

function BalanceActions(): JSX.Element {
  const [action, setAction] = useState<string>(actions[0]);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [isApproved, setIsApproved] = useState<boolean>(true);
  const [showStatus, setShowStatus] = useState<boolean>(false);
  const [isSucceed, setIsSucceed] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const renderAmount = tokenAmount ? `${tokenAmount} ` : "";
  const renderInfo = {
    Lock: {
      title: "Lock $BEPRO",
      description: "Lock $BEPRO to get oracles",
      label: `Get ${renderAmount}oracles`,
      caption: "Get Oracles from $BEPRO",
      body: `You are locking ${tokenAmount} $BEPRO /br/ to get /oracles${tokenAmount} Oracles/`,
      params() {
        return { tokenAmount };
      },
    },
    Unlock: {
      title: "Unlock $BEPRO",
      description: "Unlock $BEPRO by giving away oracles",
      label: `Recover ${renderAmount}$BEPRO`,
      caption: "Get $BEPRO from Oracles",
      body: `Give away /oracles${tokenAmount} Oracles/ /br/ to get back ${tokenAmount} $BEPRO`,
      params(from: string) {
        return { tokenAmount, from };
      },
    },
  }[action];

  useEffect(() => {
    setIsApproved(true);
    setError("");
  }, [tokenAmount]);
  async function handleConfirm() {
    try {
      setLoadingAttributes(true);
      const address: string = await BeproService.getAddress();
      const response = await BeproService.network[action.toLowerCase()]({
        ...renderInfo.params(address),
      });

      setIsSucceed(response.status);
      setShowStatus(true);
      handleCancel();
      setLoadingAttributes(false);
    } catch (error) {
      console.log(error);
      setLoadingAttributes(false);
    }
  }
  function handleCancel() {
    setTokenAmount(0);
    setIsApproved(true);
  }
  async function handleClickHandlers() {
    if (!tokenAmount) {
      return setError("$BEPRO amount needs to be higher than 0.");
    }

    try {
      const address: string = await BeproService.getAddress();
      const isApprovedSettlerToken: boolean =
        await BeproService.network.isApprovedSettlerToken({
          address,
          amount: tokenAmount,
        });

      if (!isApprovedSettlerToken) {
        return () => {
          setError(
            "Settler token not approved. Check it and try again",
          );
          setIsApproved(false);
        };
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className="content-wrapper">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex">
            {actions.map((actionItem) => (
              <button
                key={actionItem}
                onClick={() => setAction(actionItem)}
                className={clsx("btn p-0 subnav-item", {
                  active: actionItem === action,
                })}>
                <h4 className="h4 mb-0 mr-2">{actionItem}</h4>
              </button>
            ))}
          </div>
          <span className="badge-opac">200 Available</span>
        </div>
        <p className="p text-white">{renderInfo.description}</p>
        <InputNumber
          disabled={!isApproved}
          label="$BEPRO Amount"
          symbol="$BEPRO"
          error={error}
          value={tokenAmount}
          onValueChange={(values: NumberFormatValues) =>
            setTokenAmount(values.floatValue)
          }
        />
        <ApproveSettlerToken
          onApprove={setIsApproved}
          disabled={isApproved}
          className="mb-4"
        />
        <BalanceActionsHandlers
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          onClick={handleClickHandlers}
          disabled={!isApproved}
          canShow={!Boolean(error)}
          info={renderInfo}
        />
      </div>
      <BalanceActionsStatus
        info={{ title: renderInfo.title, description: renderInfo.description }}
        show={showStatus}
        isSucceed={isSucceed}
        onClose={() => setShowStatus(false)}
      />
    </>
  );
}

export default BalanceActions;
