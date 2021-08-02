import { useState } from "react";
import { Form } from "react-bootstrap";
import Modal from "./modal";

export default function StartWorking(): JSX.Element {
  const [show, setShow] = useState<boolean>(false);

  return (
    <>
      <button className="btn btn-md btn-primary" onClick={() => setShow(true)}>
        Start Working
      </button>
      <Modal
        show={show}
        title="Start Working"
        footer={
          <>
            <button
              className="btn btn-md btn-opac"
              onClick={() => setShow(false)}>
              Cancel
            </button>
            <button className="btn btn-md btn-primary">Start Working</button>
          </>
        }>
        <p className="p-small text-white-50 text-center">Are you sure?</p>
        <p className="text-center fs-6 text fw-bold">
          Remove all getContract functions from Application and instead calling
          the Object directly
        </p>
        <Form.Control type="text" placeholder="Type your Github handle" />
      </Modal>
    </>
  );
}
