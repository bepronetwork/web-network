import { useState } from "react";
import ButtonDialog from "./button-dialog";

export default function DelegateOrableTakeBack({
  amount = 0,
}: {
  amount: number;
}): JSX.Element {
  const [show, setShow] = useState<boolean>(false);
  function handleShow() {
    setShow(true);
  }
  function handleHide() {
    setShow(false);
  }

  return (
    <ButtonDialog
      title="Take Back Oracles"
      className="btn-white"
      show={show}
      onClick={handleShow}
      onHide={handleHide}
      footer={
        <>
          <button className="btn btn-md btn-opac">Cancel</button>
          <button className="btn btn-md btn-primary">Confirm</button>
        </>
      }>
      <p className="p-small emphasis-secondary new-proposal-heading">
        Give away <span className="text-bold color-purple">{amount}</span> Oracles to get back 200,000 $BEPRO
      </p>
    </ButtonDialog>
  );
}
