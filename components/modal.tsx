import { kebabCase } from "lodash";
import { Modal as ModalBootstrap } from "react-bootstrap";
import { Modal as ModalProps } from "types/modal";

export default function Modal({
  title = "",
  children = null,
  footer = null,
  ...params
}: ModalProps): JSX.Element {
  const modalTitle = `${kebabCase(title)}-modal`;

  return (
    <ModalBootstrap
      centered
      aria-labelledby={modalTitle}
      aria-describedby={modalTitle}
      backdrop="static"
      {...params}>
      <ModalBootstrap.Header>
        <ModalBootstrap.Title>{title}</ModalBootstrap.Title>
      </ModalBootstrap.Header>
      <ModalBootstrap.Body>{children}</ModalBootstrap.Body>
      <ModalBootstrap.Footer>{footer}</ModalBootstrap.Footer>
    </ModalBootstrap>
  );
}
