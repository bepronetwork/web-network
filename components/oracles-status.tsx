import clsx from "clsx";
import Modal from "./modal";
import Icon from "./icon";
import { ModalProps } from "react-bootstrap";

interface Props extends ModalProps {
  info: {
    title: string;
    description: string;
  };
  onClose(): void;
  isSucceed: boolean;
}

export default function OraclesStatus({
  info = {
    title: "",
    description: "",
  },
  onClose = () => {},
  show = false,
  isSucceed = false,
}: Props): JSX.Element {
  return (
    <Modal
      show={show}
      title={info.title}
      footer={
        <button className="btn btn-md btn-opac" onClick={onClose}>
          Close
        </button>
      }>
      <p className="p-small text-white-50 text-center">{info.description}</p>
      <div
        className={clsx("d-flex flex-column align-items-center", {
          "text-success": isSucceed,
          "text-danger": !isSucceed,
        })}>
        <Icon className="md-larger">
          {isSucceed ? "check_circle" : "error"}
        </Icon>
        <p className="text-center fs-4 mb-0 mt-2">
          Transaction {isSucceed ? "completed" : "failed"}
        </p>
      </div>
    </Modal>
  );
}
