import { ReactNode, ReactNodeArray } from "react";
import { Modal, Spinner } from "react-bootstrap";

import Translation from "components/translation";

export default function LoadingGlobal({
  show,
  children,
  ...params
}: {
  children?: ReactNode | ReactNodeArray;
  show: boolean;
  dialogClassName?: string;
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
      <Modal.Body className="d-flex flex-column align-self-center">
        <Spinner className="align-self-center p-2 my-1" animation="border" />
        <h4 className="align-self-stretch ms-3 mt-2">
          {children ? children : <Translation label="please-wait" />}
        </h4>
      </Modal.Body>
    </Modal>
  );
}
