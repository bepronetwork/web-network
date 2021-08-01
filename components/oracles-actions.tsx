import { useEffect, useState } from "react";
import OraclesActionsHandlers from "./oracles-actions-handlers";
import { NumberFormatValues } from "react-number-format";
import InputNumber from "./input-number";
import SettlerTokenApproval from "./settler-token-approval";
import OraclesBoxHeader from "./oracles-box-header";
import SettlerTokenCheck from "./settler-token-check";
import useAccount, { TYPES as AccountTypes } from "hooks/useAccount";
import { setLoadingAttributes } from "providers/loading-provider";
import BeproService from "services/bepro";

const actions: string[] = ["Lock", "Unlock"];

function OraclesActions({ onConfirm }): JSX.Element {
  const account = useAccount();
  const [show, setShow] = useState<boolean>(false);
  const [action, setAction] = useState<string>(actions[0]);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [isApproved, setIsApproved] = useState<boolean>(true);
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
  function handleCheck(isChecked: boolean) {
    if (!tokenAmount) {
      return setError("$BEPRO amount needs to be higher than 0.");
    }

    setShow(isChecked);
    setIsApproved(isChecked);
    setError(
      !isChecked ? "Settler token not approved. Check it and try again." : "",
    );
  }
  async function handleConfirm() {
    try {
      handleCancel();
      setLoadingAttributes(true);

      const transaction = await BeproService.network[action.toLowerCase()](
        Object.assign({}, renderInfo.params(account.address)),
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
      onConfirm({
        status: transaction.status,
        info: renderInfo,
      });
      setLoadingAttributes(false);
    } catch (error) {
      console.log(error);
      setLoadingAttributes(false);
    }
  }
  function handleCancel() {
    setTokenAmount(0);
    setIsApproved(true);
    setShow(false);
  }

  return (
    <>
      <div className="col-md-5">
        <div className="content-wrapper">
          <OraclesBoxHeader
            actions={actions}
            onChange={setAction}
            currentAction={action}
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
          <SettlerTokenCheck
            onCheck={handleCheck}
            disabled={!isApproved}
            amount={tokenAmount}>
            {renderInfo.label}
          </SettlerTokenCheck>
        </div>
      </div>
      <OraclesActionsHandlers
        info={renderInfo}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        show={show}
      />
    </>
  );
}

export default OraclesActions;
