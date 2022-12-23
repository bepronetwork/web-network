import {forwardRef, ReactChild, useEffect, useState} from "react";

import {useTranslation} from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import Icon from "components/icon";
import Modal from "components/modal";

import {useAppState} from "contexts/app-state";
import {addToast} from "contexts/reducers/change-toaster";

import {formatNumberToCurrency} from "helpers/formatNumber";
import {parseTransaction} from "helpers/transactions";

import {TransactionStatus} from "interfaces/enums/transaction-status";
import {TransactionTypes} from "interfaces/enums/transaction-types";

import {useAuthentication} from "x-hooks/use-authentication";

import {addTx, updateTx} from "../contexts/reducers/change-tx-list";
import {MetamaskErrors} from "../interfaces/enums/Errors";
import {SimpleBlockTransactionPayload} from "../interfaces/transaction";


interface NetworkTxButtonParams {
  txMethod: string;
  txParams: {
    from?: string;
    tokenAmount?: string;
  }
  onTxStart?: () => void;
  onSuccess: () => void;
  onFail: (message?: string) => void;
  modalTitle: string;
  modalDescription: string;
  buttonLabel?: string;
  handleEvent?: (blockNumber) => void;
  children?: ReactChild | ReactChild[];
  disabled?: boolean;
  txType: TransactionTypes;
  txCurrency: string;
  fullWidth?: boolean;
  className?: string;
}

function networkTxButton({
    txMethod,
    txParams,
    onSuccess,
    onFail,
    buttonLabel,
    modalTitle,
    modalDescription,
    className = "",
    children = null,
    fullWidth = false,
    disabled = false,
    txType = TransactionTypes.unknown,
    txCurrency,
    handleEvent
  }: NetworkTxButtonParams, elementRef) {
  const { t } = useTranslation(["common"]);

  const [showModal, setShowModal] = useState(false);
  const [txSuccess,] = useState(false);

  const { state, dispatch } = useAppState();

  const { updateWalletBalance } = useAuthentication();

  function checkForTxMethod() {
    if (!state.Service?.active?.network || !state.currentUser) return;

    if (!txMethod || typeof state.Service?.active.network[txMethod] !== "function")
      throw new Error("Wrong txMethod");
  }

  function makeTx() {
    if (!state.Service?.active?.network || !state.currentUser) return;

    const tmpTransaction = addTx([{
      type: txType,
      amount: txParams?.tokenAmount || "0",
      currency: txCurrency || t("misc.$token"),
      network: state.Service?.network?.active
    }]);

    dispatch(tmpTransaction);
    
    const methodName = txMethod === 'delegateOracles' ? 'delegate' : txMethod;
    const currency = txCurrency || t("misc.$token");
    
    state.Service?.active.network[txMethod](txParams.tokenAmount, txParams.from)
      .then(answer => {
        if (answer.status) {
          onSuccess && onSuccess();
          dispatch(addToast({
              type: "success",
              title: t("actions.success"),
              content: `
              ${t(`transactions.types.${methodName}`)} ${formatNumberToCurrency(txParams?.tokenAmount)} ${currency}
              `
          }));

          if(handleEvent && answer.blockNumber)
            handleEvent(answer.blockNumber)

          dispatch(updateTx([parseTransaction(answer, tmpTransaction.payload[0] as SimpleBlockTransactionPayload)]));
        } else {
          onFail(answer.message);
          dispatch(addToast({
              type: "danger",
              title: t("actions.failed"),
              content: answer?.message
          }));
        }
      })
      .catch((e) => {

        dispatch(updateTx([{
          ...tmpTransaction.payload[0],
          status: e?.code === MetamaskErrors.UserRejected ? TransactionStatus.rejected : TransactionStatus.failed,
        }]));

        console.error(`Failed network-tx-button`, e);

        onFail(e.message);
      })
      .finally(() => {
        updateWalletBalance(true);
      });
  }

  function getButtonClass() {
    return `mt-3 ${fullWidth ? "w-100" : ""} ${
      (!children && !buttonLabel && "visually-hidden") || ""
    } ${className}`;
  }

  function getDivClass() {
    return `d-flex flex-column align-items-center text-${
      txSuccess ? "success" : "danger"
    }`;
  }

  const modalFooter = (
    <Button color="dark-gray" onClick={() => setShowModal(false)}>
      {t("actions.close")}
    </Button>
  );

  useEffect(checkForTxMethod, [state.Service?.active, state.currentUser]);

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
        className={getButtonClass()}
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
        titlePosition="center">
        <p className="p-small text-white-50 text-center">{modalDescription}</p>
        <div className={getDivClass()}>
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

const NetworkTxButton = forwardRef(networkTxButton);

export default NetworkTxButton;
