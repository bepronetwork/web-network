import usePortal from "react-cool-portal";
import { Modal } from "./modal.d";
import { kebabCase } from "lodash";
import { useEffect } from "react";

export default function Modal({
  children = null,
  title = "",
  open = false,
}: Modal) {
  const { Portal, hide } = usePortal();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";

      return () => {
        document.body.removeAttribute("style");
      };
    }

    return () => null;
  }, [open]);

  return (
    <Portal>
      <div
        aria-labelledby={kebabCase(title)}
        aria-describedby={kebabCase(title)}
        role="presentation"
        aria-modal="true">
        <button className="btn btn-md btn-primary" onClick={hide}>
          Close
        </button>
        {children}
      </div>
    </Portal>
  );
}
