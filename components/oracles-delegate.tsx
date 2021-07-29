import { setLoadingAttributes } from "providers/loading-provider";
import { ChangeEvent, useState } from "react";
import { NumberFormatValues } from "react-number-format";
import BeproService from "services/bepro";
import InputNumber from "./input-number";
import OraclesBoxHeader from "./oracles-box-header";

function OraclesDelegate(): JSX.Element {
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  const [delegatedTo, setDelegatedTo] = useState<string>("");
  const [error, setError] = useState<string>("");

  function handleChangeOracles(params: NumberFormatValues) {
    setTokenAmount(params.floatValue);
  }
  function handleChangeAddress(params: ChangeEvent<HTMLInputElement>) {
    setDelegatedTo(params.target.value);
  }
  async function handleClickDelegate() {
    if (!tokenAmount || !delegatedTo) {
      return setError("Please fill all required fields.");
    }

    try {
      setError("");
      setLoadingAttributes(true);

      const transaction = await BeproService.network.delegateOracles({
        tokenAmount,
        delegatedTo,
      });

      // todo: onConfirm
      console.log({ transaction });
      setLoadingAttributes(false);
    } catch (error) {
      console.log({ error });
      setLoadingAttributes(false);
    }
  }

  return (
    <div className="col-md-5">
      <div className="content-wrapper">
        <OraclesBoxHeader actions="Delegate oracles" oracles={200} />
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
        <button
          className="btn btn-lg btn-primary w-100"
          onClick={handleClickDelegate}>
          DELEGATE
        </button>
      </div>
    </div>
  );
}

export default OraclesDelegate;
