import { Form } from "react-bootstrap";
import ButtonDialog from "./button-dialog";

export default function StartWorking(): JSX.Element {
  return (
    <ButtonDialog
      title="Start Working"
      className="btn-primary me-2"
      footer={({ hideModal }) => (
        <>
          <button className="btn btn-md btn-opac" onClick={hideModal}>
            Cancel
          </button>
          <button className="btn btn-md btn-primary">Start Working</button>
        </>
      )}>
      <p className="p-small text-white-50 text-center">Are you sure?</p>
      <p className="text-center fs-6 text fw-bold">
        Remove all getContract functions from Application and instead calling
        the Object directly
      </p>
      <Form.Control type="text" placeholder="Type your Github handle" />
    </ButtonDialog>
  );
}
