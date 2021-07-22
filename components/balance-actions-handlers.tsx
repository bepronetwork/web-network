import { Fragment } from "react";
import ButtonDialog from "./button-dialog";

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
  disabled = false,
}: {
  info: {
    [key: string]: string;
  };
  onCancel: () => void;
  onConfirm: () => void;
  disabled: boolean;
}): JSX.Element {
  return (
    <ButtonDialog
      title={info.title}
      label={info.label}
      disabled={disabled}
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
      )}>
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
