import SettlerTokenCheck from "./settler-token-check";
import { Fragment, useState } from "react";
import Modal from "./modal";
import { setLoadingAttributes } from "providers/loading-provider";
import BeproService from "services/bepro";

export default function OraclesActionsHandlers({
  info = {
    title: "",
    description: "",
    label: "",
    caption: "",
    body: "",
    params: () => {},
  },
  tokenAmount = 0,
  action = "",
  isApproved = true,
  onError = () => {},
  onCheck = () => {},
  onCancel = () => {},
  onConfirm = () => {},
}: {
  info: {
    title: string;
    description: string;
    label: string;
    caption: string;
    body: string;
    params(from?: string): void;
  };
  tokenAmount: number;
  action: string;
  isApproved: boolean;
  onError(message: string): void;
  onCheck(isChecked: boolean): void;
  onCancel(): void;
  onConfirm(confirmation: boolean): void;
}): JSX.Element {
  const [show, setShow] = useState<boolean>(false);

  function handleCheck(isChecked: boolean) {
    if (!tokenAmount) {
      return onError("$BEPRO amount needs to be higher than 0.");
    }

    setShow(isChecked);
    onCheck(isChecked);
    onError(
      !isChecked ? "Settler token not approved. Check it and try again." : "",
    );
  }
  async function handleConfirm() {
    try {
      handleCancel();
      setLoadingAttributes(true);

      const address: string = await BeproService.getAddress();
      const response = await BeproService.network[action.toLowerCase()](
        Object.assign({}, info.params(address)),
      );

      onConfirm(response.status);
      setLoadingAttributes(false);
    } catch (error) {
      console.log(error);
      setLoadingAttributes(false);
    }
  }
  function handleCancel() {
    onCancel();
    setShow(false);
  }

  return (
    <>
      <SettlerTokenCheck
        onCheck={handleCheck}
        disabled={!isApproved}
        amount={tokenAmount}>
        {info.label}
      </SettlerTokenCheck>
      <Modal
        title={info.title}
        show={show}
        footer={
          <>
            <button className="btn btn-md btn-opac" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-md btn-primary" onClick={handleConfirm}>
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
    </>
  );
}
