import clsx from "clsx";
import { ChangeEvent, useState } from "react";
import { Form } from "react-bootstrap";
import AccountOraclesBeproMovements from "./account-oracles-bepro-movements";

const movements: string[] = ["Lock", "Unlock"];

export default function AccountOraclesBeproMovement(): JSX.Element {
  const [movement, setMovement] = useState<string>(movements[0]);
  const [amount, setAmount] = useState<string>("");
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
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setAmount(event.target.value);
  }
  function handleCloseMovement() {
    setAmount("");
  }

  return (
    <div className="content-wrapper">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex">{renderMovements}</div>
        <span className="badge-opac">200 Available</span>
      </div>
      <p className="p text-white">{renderByMovement}</p>
      <Form.Control
        className="mb-4"
        type="text"
        value={amount}
        placeholder="Amount"
        onChange={handleChange}
      />
      <AccountOraclesBeproMovements
        onClose={handleCloseMovement}
        {...{ movement, amount }}
      />
    </div>
  );
}
