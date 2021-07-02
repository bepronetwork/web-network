import { ReactNode, ReactNodeArray } from "react";
import { Modal, Spinner } from "react-bootstrap";

export default function Loading({
  show,
  children,
  ...params
}: {
  children?: ReactNode | ReactNodeArray;
  show: boolean;
}) {
  return (
    <Modal
      {...params}
      show={show}
      size="sm"
      backdrop="static"
      aria-labelledby="loading-modal"
      centered
    >
      <Modal.Body className="show-grid px-0">
        <div className="d-flex justify-content-center">
          <Spinner className="me-2" animation="border" />
          <h4 className="mt-1">{children ? children : "Please wait"}</h4>
        </div>
      </Modal.Body>
    </Modal>
  );
}
