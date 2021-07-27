import { useEffect, useState } from "react";
import OraclesActionsHandlers from "./oracles-actions-handlers";
import { NumberFormatValues } from "react-number-format";
import OraclesActionsStatus from "./oracles-actions-status";
import InputNumber from "./input-number";
import SettlerTokenApproval from "./settler-token-approval";
import OraclesBoxHeader from "./oracles-box-header";

const actions: string[] = ["Lock", "Unlock"];

function OraclesActions(): JSX.Element {
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
  }, [tokenAmount, action]);
  function handleChangeToken(params: NumberFormatValues) {
    setTokenAmount(params.floatValue);
  }
  function handleCancel() {
    setTokenAmount(0);
    setIsApproved(true);
  }
  function handleConfirm(confirmation: boolean) {
    setIsSucceed(confirmation);
    setShowStatus(true);
  }

  return (
    <>
      <div className="col-md-5">
        <div className="content-wrapper">
          <OraclesBoxHeader
            actions={actions}
            onChange={setAction}
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
            onApprove={setIsApproved}
            disabled={isApproved}
            className="mb-4"
          />
          <OraclesActionsHandlers
            info={renderInfo}
            tokenAmount={tokenAmount}
            action={action}
            isApproved={isApproved}
            onError={setError}
            onCheck={setIsApproved}
            onCancel={handleCancel}
            onConfirm={handleConfirm}
          />
        </div>
      </div>
      <OraclesActionsStatus
        info={{ title: renderInfo.title, description: renderInfo.description }}
        show={showStatus}
        isSucceed={isSucceed}
        onClose={() => setShowStatus(false)}
      />
    </>
  );
}

export default OraclesActions;
