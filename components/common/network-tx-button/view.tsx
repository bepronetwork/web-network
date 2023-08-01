import { ReactElement, forwardRef } from "react";

import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import Icon from "components/icon";
import Modal from "components/modal";

interface NetworkTxButtonParams {
  modalTitle: string;
  modalDescription: string;
  buttonLabel: string;
  disabled: boolean;
  makeTx: () => void;
  buttonClass: string;
  showModal: boolean;
  modalFooter: ReactElement;
  divClassName: string;
  txSuccess: boolean;
}

function NetworkTxButtonModalView({
    makeTx,
    buttonClass,
    showModal,
    modalFooter,
    divClassName,
    txSuccess,
    buttonLabel,
    modalTitle,
    modalDescription,
    disabled = false,
  }: NetworkTxButtonParams,
                                  elementRef) {
  const { t } = useTranslation(["common"]);

  return (
    <>
      <button
        className="d-none"
        ref={elementRef}
        onClick={makeTx}
        disabled={disabled}
      />

      <Button
        color="purple"
        className={buttonClass}
        onClick={makeTx}
        disabled={disabled}
      >
        {disabled && <LockedIcon width={12} height={12} className="mr-1" />}{" "}
        <span>{buttonLabel}</span>
      </Button>

      <Modal
        show={showModal}
        title={modalTitle}
        footer={modalFooter}
        titlePosition="center"
      >
        <p className="p-small text-white-50 text-center">{modalDescription}</p>
        <div className={divClassName}>
          <Icon className="md-larger">
            {txSuccess ? "check_circle" : "error"}
          </Icon>
          <p className="text-center fs-4 mb-0 mt-2">
            {t("transactions.title")}{" "}
            {txSuccess ? t("actions.completed") : t("actions.failed")}
          </p>
        </div>
      </Modal>
    </>
  );
}

const NetworkTxButtonView = forwardRef(NetworkTxButtonModalView);

export default NetworkTxButtonView;
