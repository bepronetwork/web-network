import clsx from "clsx";
import { useState } from "react";
import { Form } from "react-bootstrap";
import AccountOraclesBeproMovementModal from "./account-oracles-bepro-movement-modal";

const movements: string[] = ["Lock", "Unlock"];

export default function AccountOraclesBeproMovement(): JSX.Element {
  const [movement, setMovement] = useState<string>(movements[0]);
  const [amount, setAmount] = useState<string>("");
  const renderMovements = movements.map((movementItem) => (
    <button
      key={movementItem}
      onClick={() => setMovement(movementItem)}
      className={clsx("btn p-0 subnav-item", {
        active: movementItem === movement,
      })}>
      <h4 className="h4 mb-0 mr-2">{movementItem}</h4>
    </button>
  ));

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setAmount(event.target.value);
  }

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">{renderMovements}</div>
        <span className="badge-opac">200 Available</span>
      </div>
      <div className="form-group mb-4">
        <label className="p-small trans mb-2">$BEPRO Ammout</label>
        <Form.Control
          type="text"
          value={amount}
          placeholder="$BEPRO Amount"
          onChange={handleChange}
        />
      </div>
      <AccountOraclesBeproMovementModal {...{ movement, amount }} />
    </div>
  );
}
