import clsx from "clsx";
import { kebabCase } from "lodash";
import { useEffect, useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { ButtonDialog as Props } from "types/button-dialog";

export default function ButtonDialog({
  title = "",
  children = null,
  footer = null,
  className = "btn-primary",
  label = "",
  canShow = true,
  ...params
}: Props): JSX.Element {
  const [show, setShow] = useState<boolean>(false);
  const ref = useRef<HTMLButtonElement>();
  const modalTitle = `${kebabCase(title)}-modal`;

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current?.contains(event.target as Node)) {
        setShow(canShow);
      }
    }

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [canShow]);

  return (
    <>
      <button ref={ref} className={clsx("btn btn-md", className)} {...params}>
        {label || title}
      </button>
      <Modal
        centered
        aria-labelledby={modalTitle}
        aria-describedby={modalTitle}
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
