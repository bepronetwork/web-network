import { ReactNode, ReactNodeArray, useState } from "react";
import { Modal } from "react-bootstrap";

export default function ButtonDialog({
  title = "",
  children = null,
  footer = null,
}: {
  title: string;
  children: ReactNode | ReactNodeArray;
  footer: ReactNode;
}) {
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
        {title}
      </button>
      <Modal
        show={open}
        onHide={handleCloseClick}
        centered
        aria-labelledby={title}
        aria-describedby={title}>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer>{footer}</Modal.Footer>
      </Modal>
    </>
  );
}
