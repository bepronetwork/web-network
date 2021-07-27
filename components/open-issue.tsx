import { useState } from "react";
import Modal from "./modal";

export default function OpenIssue(): JSX.Element {
  const [show, setShow] = useState<boolean>(false);

  return (
    <>
      <button className="btn btn-md btn-primary" onClick={() => setShow(true)}>
        Open issue
      </button>
      <Modal
        show={show}
        title="Open issue"
        footer={
          <>
            <button
              className="btn btn-md btn-opac"
              onClick={() => setShow(false)}>
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
      </Modal>
    </>
  );
}
