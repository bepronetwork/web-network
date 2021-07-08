import { useState } from "react";
import ButtonDialog from "./button-dialog";

export default function OpenIssue() {
  const [show, setShow] = useState<boolean>(false);

  function handleShow() {
    setShow(true);
  }
  function handleHide() {
    setShow(false);
  }

  return (
    <ButtonDialog
      title="Open issue"
      show={show}
      onClick={handleShow}
      onHide={handleHide}
      footer={
        <>
          <button className="btn btn-md btn-opac" onClick={handleHide}>
            Cancel
          </button>
          <button className="btn btn-md btn-primary">Open Issue</button>
        </>
      }>
      <p className="p-small text-white-50 text-center">Are you sure?</p>
      <p className="text-center fs-6 text fw-bold">
        Remove all getContract functions from Application and instead calling
        the Object directly
      </p>
      <div className="px-3 py-2 d-flex flex-column btn-opac rounded-3 align-items-center">
        <span className="p-small text-white-50">Reward</span>
        <span className="text fw-bold">200K $BEPRO</span>
      </div>
    </ButtonDialog>
  );
}
