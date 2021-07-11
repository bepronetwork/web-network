import { Modal } from "react-bootstrap";

export default function BalanceActionsSuccess({
  info = { title: "", description: "" },
  onClose = () => {},
  show = false,
}: {
  info: { title: string; description: string };
  onClose: () => void;
  show: boolean;
}): JSX.Element {
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
        <div className="d-flex flex-column align-items-center">
          <svg
            width="64"
            height="64"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mb-2 mt-3">
            <path
              d="M32 0C14.336 0 0 14.336 0 32C0 49.664 14.336 64 32 64C49.664 64 64 49.664 64 32C64 14.336 49.664 0 32 0ZM25.6 48L9.6 32L14.112 27.488L25.6 38.944L49.888 14.656L54.4 19.2L25.6 48Z"
              fill="#35E0AD"
            />
          </svg>
          <p className="text-center fs-4 text-success">Transaction completed</p>
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
