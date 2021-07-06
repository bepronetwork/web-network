import clsx from "clsx";
import { ChangeEvent, useState } from "react";
import AccountOraclesBeproMovements from "./account-oracles-bepro-movements";
import NumberFormat, { NumberFormatValues } from "react-number-format";

const movements: string[] = ["Lock", "Unlock"];

export default function AccountOraclesBeproMovement(): JSX.Element {
  const [movement, setMovement] = useState<string>(movements[0]);
  const [amount, setAmount] = useState<number>(0);
  const renderMovements = movements.map((movementItem) => (
    <button
      key={movementItem}
      onClick={() => handleClickMovement(movementItem)}
      className={clsx("btn p-0 subnav-item", {
        active: movementItem === movement,
      })}>
      <h4 className="h4 mb-0 mr-2">{movementItem}</h4>
    </button>
  ));
  const renderByMovement = {
    Lock: "Lock $BEPRO to get oracles",
    Unlock: "Unlock $BEPRO by giving away oracles",
  }[movement];

  function handleClickMovement(params: string) {
    handleCloseMovement();
    setMovement(params);
  }
  function handleChange(values: NumberFormatValues) {
    setAmount(values.floatValue);
  }
  function handleCloseMovement() {
    setAmount(0);
  }

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">{renderMovements}</div>
        <span className="badge-opac">200 Available</span>
      </div>
      <p className="p text-white">{renderByMovement}</p>
      <div className="input-group mb-4">
        <NumberFormat
          min="0"
          className="form-control"
          placeholder="0"
          value={amount}
          thousandSeparator={true}
          onValueChange={handleChange}
        />
        <span className="input-group-text text-white-50 p-small">$BEPRO</span>
      </div>
      <button className="btn btn-md btn-lg btn-trans w-100 mb-4">
        Approve
      </button>
      <AccountOraclesBeproMovements
        onClose={handleCloseMovement}
        {...{ movement, amount }}
      />
    </div>
  );
}
