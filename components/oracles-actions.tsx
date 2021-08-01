import { Fragment, useEffect, useRef, useState } from "react";
import { NumberFormatValues } from "react-number-format";
import InputNumber from "./input-number";
import SettlerTokenApproval from "./settler-token-approval";
import OraclesBoxHeader from "./oracles-box-header";
import SettlerTokenCheck from "./settler-token-check";
import useAccount from "hooks/useAccount";
import Modal from "./modal";
import NetworkTx from "./network-tx";

const actions: string[] = ["Lock", "Unlock"];

function OraclesActions(): JSX.Element {
  const account = useAccount();
  const [show, setShow] = useState<boolean>(false);
  const [action, setAction] = useState<string>(actions[0]);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [isApproved, setIsApproved] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const networkTxRef = useRef<HTMLButtonElement>(null);
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
  function handleConfirm() {
    networkTxRef.current.click();
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
            className="mb-3"
          />
          <SettlerTokenCheck
            onCheck={handleCheck}
            disabled={!isApproved}
            amount={tokenAmount}>
            {renderInfo.label}
          </SettlerTokenCheck>
        </div>
      </div>
      <NetworkTx
        ref={networkTxRef}
        onTransaction={handleCancel}
        onTransactionError={setError}
        call={{
          id: action.toLowerCase(),
          params: renderInfo.params(account.address),
        }}
        info={renderInfo}
      />
      <Modal
        title={renderInfo.title}
        show={show}
        footer={
          <>
            <button className="btn btn-md btn-opac" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-md btn-primary" onClick={handleConfirm}>
              Confirm
            </button>
          </>
        }>
        <p className="p-small text-white-50 text-center">
          {renderInfo.caption}
        </p>
        <p className="text-center fs-4">
          {renderInfo.body?.split("/").map((sentence: string) => {
            const Component =
              (sentence.startsWith("oracles") && "span") || Fragment;

            return (
              <Fragment key={sentence}>
                <Component
                  {...(sentence.startsWith("oracles") && {
                    className: "text-bold color-purple",
                  })}>
                  {sentence.replace(/oracles|br/, "")}
                </Component>
                {sentence.startsWith("br") && <br />}
              </Fragment>
            );
          })}
        </p>
      </Modal>
    </>
  );
}

export default OraclesActions;
