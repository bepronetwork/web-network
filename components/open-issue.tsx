import { useState } from "react";
import Button from "./button";
import Modal from "./modal";

// Review This component is not being used
export default function OpenIssue(): JSX.Element {
  const [show, setShow] = useState<boolean>(false);

  return (
    <>
      <Button onClick={() => setShow(true)}>
        Open issue
      </Button>
      <Modal
        show={show}
        title="Open issue"
        footer={
          <>
            <Button
              color="dark-gray"
              onClick={() => setShow(false)}>
              Cancel
            </Button>
            <Button>Open Issue</Button>
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
