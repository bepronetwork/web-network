import { kebabCase } from "lodash";
import { ComponentPropsWithoutRef, ReactNode, ReactNodeArray } from "react";
import { Modal } from "react-bootstrap";

interface Props extends ComponentPropsWithoutRef<"button"> {
  title: string;
  footer?: ReactNode;
  show: boolean;
  onHide?: () => void;
  className?: string;
  label?: string;
}

export default function ButtonDialog({
  title = "",
  children = null,
  footer = null,
  show = false,
  onHide = () => {},
  className = "btn-primary",
  label = "",
  ...params
}: Props) {
  return (
    <>
      <button className={`btn btn-md ${className}`} {...params}>
        {label || title}
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
