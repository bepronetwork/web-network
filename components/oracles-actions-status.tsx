import clsx from "clsx";
import { Modal } from "react-bootstrap";
import Icon from "./icon";

export default function OraclesActionsStatus({
  info = { title: "", description: "" },
  onClose = () => {},
  show = false,
  isSucceed = false,
}: {
  info: { title: string; description: string };
  onClose: () => void;
  show: boolean;
  isSucceed: boolean;
}): JSX.Element {
  const renderInfo = {
    true: {
      icon: "check_circle",
      description: "Transaction completed",
      className: "text-success",
    },
    false: {
      icon: "error",
      description: "Transaction failed",
      className: "text-danger",
    },
  }[String(isSucceed)];

  return (
    <Modal
      centered
      aria-labelledby="balance-actions-success-modal"
      aria-describedby="balance-actions-success-modal"
      backdrop="static"
      show={show}>
      <Modal.Header>
        <Modal.Title>{info.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="p-small text-white-50 text-center">{info.description}</p>
        <div
          className={clsx(
            "d-flex flex-column align-items-center",
            renderInfo.className,
          )}>
          <Icon className="md-larger">{renderInfo.icon}</Icon>
          <p className="text-center fs-4 mb-0 mt-2">{renderInfo.description}</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-md btn-opac" onClick={onClose}>
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
}
