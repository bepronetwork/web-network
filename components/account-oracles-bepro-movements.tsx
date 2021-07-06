import { Fragment, useState } from "react";
import ButtonDialog from "./button-dialog";

export default function AccountOraclesBeproMovements({
  movement = "Lock",
  amount = 0,
  onClose = () => {},
}: {
  movement: string;
  amount: number;
  onClose: () => void;
}): JSX.Element {
  const [show, setShow] = useState<boolean>(false);
  const [state, setState] = useState<string>("waiting");
  const renderByMovement = {
    Lock: {
      title: `Lock $BEPRO`,
      label: `Get ${amount} oracles`,
      caption: "Get Oracles from $BEPRO",
      body: `You are locking ${amount} $BEPRO /br/ to get /oracles${amount} Oracles/`,
    },
    Unlock: {
      title: `Unlock $BEPRO`,
      label: `Recover ${amount} $BEPRO`,
      caption: "Get $BEPRO from Oracles",
      body: `Give away /oracles${amount} Oracles/ /br/ to get back ${amount} $BEPRO`,
    },
  }[movement];
  const renderByState = {
    waiting: {
      body: (
        <p className="text-center fs-4">
          {renderByMovement.body?.split("/").map((sentence: string) => {
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
      ),
      label: "Confirm",
      button: (
        <button className="btn btn-md btn-opac" onClick={handleHide}>
          Cancel
        </button>
      ),
      fx: handleClickConfirmation,
    },
    confirmed: {
      body: (
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
      label: "Close",
      button: null,
      fx: handleHide,
    },
  }[state];

  function handleShow() {
    setShow(true);
  }
  function handleHide() {
    setShow(false);
    setState("waiting");
    onClose();
  }
  function handleClickConfirmation() {
    setState("confirmed");
  }

  return (
    <ButtonDialog
      title={renderByMovement.title}
      label={renderByMovement.label}
      disabled={!amount}
      className="btn-lg btn-primary w-100"
      show={show}
      onClick={handleShow}
      onHide={handleHide}
      footer={
        <>
          {renderByState.button}
          <button className="btn btn-md btn-primary" onClick={renderByState.fx}>
            {renderByState.label}
          </button>
        </>
      }>
      <p className="p-small text-white-50 text-center">
        {renderByMovement.caption}
      </p>
      {renderByState.body}
    </ButtonDialog>
  );
}
