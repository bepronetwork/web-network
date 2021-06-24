import { useState } from "react";
import { Form } from "react-bootstrap";
import ButtonDialog from "./button-dialog";

export default function StartWorking() {
  const [show, setShow] = useState<boolean>(false);

  function handleShow() {
    setShow(true);
  }
  function handleHide() {
    setShow(false);
  }

  return (
    <ButtonDialog
      title="Start Working"
      show={show}
      onClick={handleShow}
      onHide={handleHide}
      footer={
        <>
          <button className="btn btn-md btn-opac" onClick={handleHide}>
            Cancel
          </button>
          <button className="btn btn-md btn-primary">Start Working</button>
        </>
      }>
      <p className="text-center fs-6 text fw-bold">
        Remove all getContract functions from Application and instead calling
        the Object directly
      </p>
      <Form.Control type="text" placeholder="Type your Github handle" />
    </ButtonDialog>
  );
}
