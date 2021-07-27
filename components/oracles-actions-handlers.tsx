import { Fragment } from "react";
import { Modal as ModalProps } from "types/modal";
import Modal from "./modal";

interface Props extends ModalProps {
  info: {
    [key: string]: string;
  };
}

export default function OraclesActionsHandlers({
  info = {
    title: "",
    description: "",
    label: "",
    caption: "",
    body: "",
  },
  ...params
}: Props): JSX.Element {
  return (
    <Modal title={info.title} {...params}>
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
