import { useState } from "react";
import { Modal } from "react-bootstrap";

export default function NewProposal() {
  const [open, setOpen] = useState(false);

  function handleOpenClick() {
    setOpen(true);
  }
  function handleCloseClick() {
    setOpen(false);
  }

  return (
    <>
      <button className="btn btn-md btn-primary" onClick={handleOpenClick}>
        Start working
      </button>
      <Modal show={open} onHide={handleCloseClick} centered>
        test
      </Modal>
    </>
  );
}
