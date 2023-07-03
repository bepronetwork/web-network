import { ReactElement } from "react";

import {kebabCase} from "lodash";

import WebThreeUnavailable from "assets/web3-unavailable";

import If from "components/If";
import Modal from "components/modal";

import { Modal as ModalProps } from "types/modal";

interface NoMetamaskModalViewProps {
  title: string;
  warning?: string;
  description: string;
  actions?: ReactElement[];
}

export default function NoMetamaskModalView({
  show,
  onCloseClick,
  title,
  actions,
  warning,
  description,
}: Partial<ModalProps> & NoMetamaskModalViewProps) {
  function ModalFooter() {
    return(
      <div className="mb-2 d-flex flex-row justify-content-around">
        {actions}
      </div>
    );
  }

  return (
    <Modal
      centered
      aria-labelledby={`${kebabCase("WebThreeDialog")}-modal`}
      aria-describedby={`${kebabCase("WebThreeDialog")}-modal`}
      show={show}
      title={title}
      footer={<ModalFooter />}
      onCloseClick={onCloseClick}
    >
      <If condition={!!warning}>
        <p className="caption-small text-warning text-center mb-2">
          {warning}
        </p>
      </If>

      <div className="d-flex flex-column align-items-center">
        <WebThreeUnavailable/>

        <p className="p mb-0 mt-4 text-center fs-small">
          {description}
        </p>
      </div>
    </Modal>
  );
}
