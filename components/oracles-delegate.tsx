import NetworkTx from "./network-tx";
import useAccount from "hooks/useAccount";
import { ChangeEvent, useState } from "react";
import { NumberFormatValues } from "react-number-format";
import InputNumber from "./input-number";
import OraclesBoxHeader from "./oracles-box-header";

function OraclesDelegate(): JSX.Element {
  const account = useAccount();
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [delegatedTo, setDelegatedTo] = useState<string>("");
  const [error, setError] = useState<string>("");

  function handleChangeOracles(params: NumberFormatValues) {
    setTokenAmount(params.floatValue);
  }
  function handleChangeAddress(params: ChangeEvent<HTMLInputElement>) {
    setDelegatedTo(params.target.value);
  }
  function handleClickVerification() {
    if (!tokenAmount || !delegatedTo) {
      return setError("Please fill all required fields.");
    }
  }
  function handleTransition() {
    setError("");
  }

  return (
    <div className="col-md-5">
      <div className="content-wrapper">
        <OraclesBoxHeader
          actions="Delegate oracles"
          available={parseInt(account.oracles.oraclesDelegatedByOthers)}
        />
        <InputNumber
          label="Oracles Ammout"
          value={tokenAmount}
          onValueChange={handleChangeOracles}
          thousandSeparator
        />
        <div className="form-group">
          <label className="p-small trans mb-2">Delegation address</label>
          <input
            value={delegatedTo}
            onChange={handleChangeAddress}
            type="text"
            className="form-control"
            placeholder="Type an address"
          />
        </div>
        {error && <p className="p-small text-danger mt-2">{error}</p>}
        <NetworkTx
          className="btn-lg w-100 mt-3"
          onTransaction={handleTransition}
          onTransactionError={setError}
          onClickVerification={handleClickVerification}
          call={{
            id: "delegateOracles",
            params: {
              tokenAmount,
              delegatedTo,
            },
          }}
          info={{
            title: "Delegate oracles",
            description: "Delegate oracles for an address",
          }}>
          DELEGATE
        </NetworkTx>
      </div>
    </div>
  );
}

export default OraclesDelegate;
