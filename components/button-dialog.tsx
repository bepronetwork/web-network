import { kebabCase } from "lodash";
import { ReactNode, ReactNodeArray } from "react";
import { Modal } from "react-bootstrap";

export default function ButtonDialog({
  title = "",
  children = null,
  footer = null,
  onClick = () => {},
  show = false,
  onHide = () => {},
}: {
  title: string;
  children: ReactNode | ReactNodeArray;
  footer?: ReactNode;
  onClick: () => void;
  show: boolean;
  onHide?: () => void;
}) {
  return (
    <>
      <button className="btn btn-md btn-primary" onClick={onClick}>
        {title}
      </button>
      <Modal
        centered
        aria-labelledby={`${kebabCase(title)}-modal`}
        aria-describedby={`${kebabCase(title)}-modal`}
        show={show}
        onHide={onHide}>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer>{footer}</Modal.Footer>
      </Modal>
    </>
  );
}
