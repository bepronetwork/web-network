import { ReactNode, ReactNodeArray } from "react";
import { Modal } from "react-bootstrap";

export default function ButtonDialog({
  title = "",
  children = null,
  footer = null,
  onClick = () => {},
  ...params
}: {
  title: string;
  children: ReactNode | ReactNodeArray;
  footer?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <>
      <button className="btn btn-md btn-primary" onClick={onClick}>
        {title}
      </button>
      <Modal
        centered
        aria-labelledby={title}
        aria-describedby={title}
        {...params}>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer>{footer}</Modal.Footer>
      </Modal>
    </>
  );
}
