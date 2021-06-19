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
        <Modal.Header>
          <Modal.Title>New Proposal</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="p-small">Select a pull request </p>
          <br />
          <p className="p-small">Propose distribution</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-md btn-primary">Create Proposal</button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
