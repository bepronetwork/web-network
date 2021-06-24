import { useState } from "react";
import ButtonDialog from "./button-dialog";

export default function DelegateOrableTakeBack({
  movement = "Lock",
  amount = "0",
}: {
  movement: string;
  amount: string;
}): JSX.Element {
  const [show, setShow] = useState<boolean>(false);
  const renderPlainText = {
    Lock: [
      "Lock",
      "Get Oracles from $BEPRO",
      `You are locking ${amount} $BEPRO to get /oracles${amount} Oracles/`,
    ],
    Unlock: [
      "Unlock",
      "Get $BEPRO form Oracles",
      `Give away /oracles${amount} Oracles/ to get back ${amount} $BEPRO`,
    ],
  }[movement];

  function handleShow() {
    setShow(true);
  }
  function handleHide() {
    setShow(false);
  }

  return (
    <ButtonDialog
      title={`${renderPlainText[0]} $BEPRO`}
      className="btn-white"
      show={show}
      onClick={handleShow}
      onHide={handleHide}
      footer={
        <>
          <button className="btn btn-md btn-opac" onClick={handleHide}>
            Cancel
          </button>
          <button className="btn btn-md btn-primary">Confirm</button>
        </>
      }>
      <p className="p-small text-white-50 text-center">{renderPlainText[1]}</p>
      <p className="text-center fs-4">
        {renderPlainText[2]
          ?.split("/")
          .map((sentence: string) =>
            sentence.startsWith("oracles") ? (
              <span className="text-bold color-purple">
                {sentence.replace(/oracles/, "")}
              </span>
            ) : (
              sentence
            ),
          )}
      </p>
    </ButtonDialog>
  );
}
