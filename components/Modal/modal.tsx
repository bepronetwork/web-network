import usePortal from "react-cool-portal";
import { Modal as ModalTypes } from "./modal.d";
import { kebabCase } from "lodash";
import { useEffect } from "react";

export default function Modal({
  children = null,
  title = "",
  open = false,
  onClose = () => {},
}: ModalTypes) {
  const { Portal, show, hide } = usePortal({
    defaultShow: false,
  });

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      show();

      return () => {
        document.body.removeAttribute("style");
      };
    }

    return () => null;
  }, [open, show]);
  function handleBackdropClick(event: MouseEvent) {
    const { id } = event.target as HTMLDivElement;
    if (id === "modal-backdrop") {
      handleCloseClick();
    }
  }
  function handleCloseClick() {
    onClose();
    hide();
  }

  return (
    <Portal>
      <div
        id="modal-backdrop"
        className="modal-backdrop"
        role="presentation"
        tabIndex={-1}
        onClick={handleBackdropClick}>
        <div
          aria-labelledby={kebabCase(title)}
          aria-describedby={kebabCase(title)}
          aria-modal="true"
          role="dialog"
          className="modal-dialog">
          <button className="btn btn-md btn-primary" onClick={handleCloseClick}>
            Close
          </button>
          {children}
        </div>
      </div>
    </Portal>
  );
}
