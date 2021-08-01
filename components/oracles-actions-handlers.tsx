import { Fragment } from "react";
import Modal from "./modal";
import { ModalProps } from "react-bootstrap";

interface Props extends ModalProps {
  info: {
    title: string;
    caption: string;
    body: string;
  };
  onCancel(): void;
  onConfirm(): void;
}

export default function OraclesActionsHandlers({
  info = {
    title: "",
    caption: "",
    body: "",
  },
  onCancel = () => {},
  onConfirm = () => {},
  show = false,
}: Props): JSX.Element {
  return (
    <Modal
      title={info.title}
      show={show}
      footer={
        <>
          <button className="btn btn-md btn-opac" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-md btn-primary" onClick={onConfirm}>
            Confirm
          </button>
        </>
      }>
      <p className="p-small text-white-50 text-center">{info.caption}</p>
      <p className="text-center fs-4">
        {info.body?.split("/").map((sentence: string) => {
          const Component =
            (sentence.startsWith("oracles") && "span") || Fragment;

          return (
            <Fragment key={sentence}>
              <Component
                {...(sentence.startsWith("oracles") && {
                  className: "text-bold color-purple",
                })}>
                {sentence.replace(/oracles|br/, "")}
              </Component>
              {sentence.startsWith("br") && <br />}
            </Fragment>
          );
        })}
      </p>
    </Modal>
  );
}
