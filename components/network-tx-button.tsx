import { forwardRef, useContext, useEffect, useState, ReactChild } from "react";
import { useTranslation } from "next-i18next";
import LockedIcon from "assets/icons/locked-icon";
import Button from "components/button";
import Icon from "components/icon";
import Modal from "components/modal";
import { AppStateContext } from "contexts/app-state";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";
import { addToast } from "contexts/reducers/change-toaster";
import { formatNumberToCurrency } from "helpers/formatNumber";
import { parseTransaction } from "helpers/transactions";
import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import useApi from "x-hooks/use-api";

import {addTx, updateTx} from "../contexts/reducers/change-tx-list";
import {MetamaskErrors} from "../interfaces/enums/Errors";

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
    txCurrency
  }: NetworkTxButtonParams, elementRef) {
  const { t } = useTranslation(["common"]);

  const [showModal, setShowModal] = useState(false);
  const [txSuccess,] = useState(false);

  const { dispatch } = useContext(AppStateContext);

  const { processEvent } = useApi();
  const { activeNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const { wallet, updateWalletBalance } = useAuthentication();

  function checkForTxMethod() {
    if (!DAOService || !wallet) return;

    if (!txMethod || typeof DAOService.network[txMethod] !== "function")
      throw new Error("Wrong txMethod");
  }

  function makeTx() {
    if (!DAOService || !wallet) return;

    const tmpTransaction = addTx([{
        type: txType,
        amount: txParams?.tokenAmount || "0",
        currency: txCurrency || t("misc.$token")
      } as any]);

    dispatch(tmpTransaction);
    
    const methodName = txMethod === 'delegateOracles' ? 'delegate' : txMethod;
    const currency = txCurrency || t("misc.$token");
    
    DAOService.network[txMethod](txParams.tokenAmount, txParams.from)
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

          if (answer.blockNumber)
            processEvent("oracles","changed", activeNetwork.name, {fromBlock:answer.blockNumber}).catch(console.debug);

          updateTx([parseTransaction(answer, tmpTransaction.payload[0])])
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
        updateWalletBalance();
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

  useEffect(checkForTxMethod, [DAOService, wallet]);

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
