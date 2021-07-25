import { Fragment } from "react";
import { ButtonDialog as ButtonDialogProps } from "types/button-dialog";
import ButtonDialog from "./button-dialog";

interface Props extends ButtonDialogProps {
  info: {
    [key: string]: string;
  };
  onCancel: () => void;
  onConfirm: () => void;
}

export default function BalanceActionsHandlers({
  info = {
    title: "",
    description: "",
    label: "",
    caption: "",
    body: "",
  },
  onCancel = () => {},
  onConfirm = () => {},
  ...params
}: Props): JSX.Element {
  return (
    <ButtonDialog
      title={info.title}
      label={info.label}
      className="btn-lg btn-primary w-100"
      footer={({ hideModal }) => (
        <>
          <button
            className="btn btn-md btn-opac"
            onClick={() => {
              onCancel();
              hideModal();
            }}>
            Cancel
          </button>
          <button
            className="btn btn-md btn-primary"
            onClick={() => {
              onConfirm();
              hideModal();
            }}>
            Confirm
          </button>
        </>
      )}
      {...params}>
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
    </ButtonDialog>
  );
}
