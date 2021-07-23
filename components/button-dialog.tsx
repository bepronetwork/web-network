import clsx from "clsx";
import { kebabCase } from "lodash";
import { ComponentPropsWithoutRef, ReactElement, useState } from "react";
import { Modal } from "react-bootstrap";

interface Props extends ComponentPropsWithoutRef<"button"> {
  title: string;
  footer?:
    | (({ hideModal }: { hideModal: () => void }) => ReactElement)
    | ReactElement;
  onClick?: () => void;
  className?: string;
  label?: string;
}

export default function ButtonDialog({
  title = "",
  children = null,
  footer = null,
  onClick = () => {},
  className = "btn-primary",
  label = "",
  ...params
}: Props): JSX.Element {
  const [show, setShow] = useState<boolean>(false);

  return (
    <>
      <button
        className={clsx("btn btn-md", className)}
        onClick={() => {
          setShow(true);
          onClick();
        }}
        {...params}>
        {label || title}
      </button>
      <Modal
        centered
        aria-labelledby={`${kebabCase(title)}-modal`}
        aria-describedby={`${kebabCase(title)}-modal`}
        show={show}
        backdrop="static">
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{children}</Modal.Body>
        <Modal.Footer>
          {typeof footer === "function"
            ? footer({
                hideModal: () => {
                  setShow(false);
                },
              })
            : footer}
        </Modal.Footer>
      </Modal>
    </>
  );
}
