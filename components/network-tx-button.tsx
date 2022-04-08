import { forwardRef, useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import Icon from "components/icon";
import Modal from "components/modal";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useNetwork } from "contexts/network";
import { addToast } from "contexts/reducers/add-toast";
import { addTransaction } from "contexts/reducers/add-transaction";
import { updateTransaction } from "contexts/reducers/update-transaction";

import { parseTransaction } from "helpers/transactions";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { TransactionCurrency } from "interfaces/transaction";

import { BeproService } from "services/bepro-service";

import useTransactions from "x-hooks/useTransactions";

interface NetworkTxButtonParams {
  txMethod: string;
  txParams: any;
  onTxStart?: () => void;
  onSuccess: () => void;
  onFail: (message?: string) => void;
  modalTitle: string;
  modalDescription: string;
  buttonLabel?: string;
  children?: JSX.Element;
  disabled?: boolean;
  txType: TransactionTypes;
  txCurrency: TransactionCurrency;
  fullWidth?: boolean;
  useContract?: boolean;
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
    useContract = false,
    disabled = false,
    txType = TransactionTypes.unknown,
    txCurrency = "$BEPRO"
  }: NetworkTxButtonParams,
                         elementRef) {
  const { t } = useTranslation(["common"]);

  const [showModal, setShowModal] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);

  const { dispatch } = useContext(ApplicationContext);
  const { wallet, beproServiceStarted, updateWalletBalance } =
    useAuthentication();

  const txWindow = useTransactions();
  const { activeNetwork } = useNetwork();

  function checkForTxMethod() {
    if (!beproServiceStarted || !wallet) return;

    if (!txMethod || typeof BeproService.network[txMethod] !== "function")
      throw new Error("Wrong txMethod");
  }

  function makeTx() {
    if (!beproServiceStarted || !wallet) return;

    const tmpTransaction = addTransaction({
        type: txType,
        amount: txParams?.tokenAmount || 0,
        currency: txCurrency
    },
                                          activeNetwork);
    dispatch(tmpTransaction);

    let transactionMethod;

    if (!useContract)
      transactionMethod = BeproService.network[txMethod](txParams.tokenAmount,
                                                         txParams.from);
    else {
      const weiAmount = BeproService.toWei(txParams?.tokenAmount.toString());

      transactionMethod = BeproService.network.contract.methods[txMethod];
      transactionMethod =
        txMethod === "lock"
          ? transactionMethod(weiAmount).send({ from: wallet.address })
          : transactionMethod(weiAmount, txParams?.from).send({
              from: wallet.address
          });
    }

    transactionMethod
      .then((answer) => {
        if (answer.status) {
          onSuccess && onSuccess();
          dispatch(addToast({
              type: "success",
              title: t("actions.success"),
              content: `${txMethod} ${txParams?.tokenAmount} ${txCurrency}`
          }));

          txWindow.updateItem(tmpTransaction.payload.id,
                              parseTransaction(answer, tmpTransaction.payload));
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
        onFail(e.message);
        if (e?.message?.search("User denied") > -1)
          dispatch(updateTransaction({
              ...(tmpTransaction.payload as any),
              remove: true
          }));
        else
          dispatch(updateTransaction({
              ...(tmpTransaction.payload as any),
              status: TransactionStatus.failed
          }));
        console.error(e);
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

  useEffect(checkForTxMethod, [beproServiceStarted, wallet]);

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
        titlePosition="center"
      >
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
