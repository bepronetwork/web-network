import { ReactNode, ReactNodeArray } from "react";
import { Modal, Spinner } from "react-bootstrap";

import Translation from "./translation";

export default function LoadingGlobal({
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
      <Modal.Body className="d-flex align-self-center">
        <Spinner className="align-self-center p-2 mt-1" animation="border" />
        <h4 className="align-self-stretch ms-3 mt-2">
          {children ? children : <Translation label="please-wait" />}
        </h4>
      </Modal.Body>
    </Modal>
  );
}
