import { useEffect, useState } from "react";
import OraclesActionsHandlers from "./oracles-actions-handlers";
import { NumberFormatValues } from "react-number-format";
import OraclesActionsStatus from "./oracles-actions-status";
import InputNumber from "./input-number";
import SettlerTokenApproval from "./settler-token-approval";
import BeproService from "../services/bepro";
import { setLoadingAttributes } from "providers/loading-provider";
import OraclesBoxHeader from "./oracles-box-header";
import SettlerTokenCheck from "components/settler-token-check";

const actions: string[] = ["Lock", "Unlock"];

function OraclesActions(): JSX.Element {
  const [action, setAction] = useState<string>(actions[0]);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [isApproved, setIsApproved] = useState<boolean>(true);
  const [showStatus, setShowStatus] = useState<boolean>(false);
  const [showHandlers, setShowHandlers] = useState<boolean>(false);
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
  }, [tokenAmount, action]);
  function handleChangeAction(params: string) {
    setAction(params);
  }
  function handleChangeToken(params: NumberFormatValues) {
    setTokenAmount(params.floatValue);
  }
  function handleApproveSettlerToken(params: boolean) {
    setIsApproved(params);
  }
  function handleCloseStatus() {
    setShowStatus(false);
  }
  function handleCancel() {
    setTokenAmount(0);
    setIsApproved(true);
    setShowHandlers(false);
  }
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
  function handleCheckSettlerToken(isChecked: boolean) {
    if (!tokenAmount) {
      return setError("$BEPRO amount needs to be higher than 0.");
    }

    if (!isChecked) {
      return setError("Settler token not approved. Check it and try again");
    }

    setShowHandlers(isChecked);
    setIsApproved(isChecked);
  }

  return (
    <>
      <div className="col-md-5">
        <div className="content-wrapper">
          <OraclesBoxHeader
            actions={actions}
            onChange={handleChangeAction}
            currentAction={action}
            oracles={200}
          />
          <p className="p text-white">{renderInfo.description}</p>
          <InputNumber
            disabled={!isApproved}
            label="$BEPRO Amount"
            symbol="$BEPRO"
            error={error}
            helperText={error}
            value={tokenAmount}
            onValueChange={handleChangeToken}
            thousandSeparator
          />
          <SettlerTokenApproval
            onApprove={handleApproveSettlerToken}
            disabled={isApproved}
            className="mb-4"
          />
          <SettlerTokenCheck
            onCheck={handleCheckSettlerToken}
            disabled={!isApproved}
            amount={tokenAmount}>
            {renderInfo.label}
          </SettlerTokenCheck>
        </div>
      </div>
      <OraclesActionsHandlers
        info={renderInfo}
        show={showHandlers}
        footer={
          <>
            <button className="btn btn-md btn-opac" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-md btn-primary" onClick={handleConfirm}>
              Confirm
            </button>
          </>
        }
      />
      <OraclesActionsStatus
        info={{ title: renderInfo.title, description: renderInfo.description }}
        show={showStatus}
        isSucceed={isSucceed}
        onClose={handleCloseStatus}
      />
    </>
  );
}

export default OraclesActions;
