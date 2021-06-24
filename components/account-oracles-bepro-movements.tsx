import clsx from "clsx";
import { useState } from "react";
import ButtonDialog from "./button-dialog";

export default function AccountOraclesBeproMovements({
  movement = "Lock",
  amount = "0",
}: {
  movement: string;
  amount: string;
}): JSX.Element {
  const [show, setShow] = useState<boolean>(false);
  const [state, setState] = useState<string>("waiting");
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
  const renderBodyText = {
    waiting: (
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
    ),
    confirmed: (
      <div className="d-flex flex-column align-items-center">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mb-2 mt-3">
          <path
            d="M32 0C14.336 0 0 14.336 0 32C0 49.664 14.336 64 32 64C49.664 64 64 49.664 64 32C64 14.336 49.664 0 32 0ZM25.6 48L9.6 32L14.112 27.488L25.6 38.944L49.888 14.656L54.4 19.2L25.6 48Z"
            fill="#35E0AD"
          />
        </svg>
        <p className="text-center fs-4 text-success">Transaction completed</p>
      </div>
    ),
  }[state];
  const renderLabel = {
    waiting: "Confirm",
    confirmed: "Close",
  }[state];
  const renderCancelButton = state === "waiting" && (
    <button className="btn btn-md btn-opac" onClick={handleHide}>
      Cancel
    </button>
  );
  const renderButtonHandler = {
    waiting: handleClickConfirmation,
    confirmed: handleHide,
  }[state];

  function handleShow() {
    setShow(true);
  }
  function handleHide() {
    setShow(false);
    setState("waiting");
  }
  function handleClickConfirmation() {
    setState("confirmed");
  }

  return (
    <ButtonDialog
      title={`${renderPlainText[0]} $BEPRO`}
      disabled={!amount}
      className="btn-white"
      show={show}
      onClick={handleShow}
      onHide={handleHide}
      footer={
        <>
          {renderCancelButton}
          <button
            className="btn btn-md btn-primary"
            onClick={renderButtonHandler}>
            {renderLabel}
          </button>
        </>
      }>
      <p className="p-small text-white-50 text-center">{renderPlainText[1]}</p>
      {renderBodyText}
    </ButtonDialog>
  );
}
