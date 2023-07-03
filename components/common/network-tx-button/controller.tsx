import {MutableRefObject, ReactChild, useEffect, useState} from "react";

import {useTranslation} from "next-i18next";

import Button from "components/button";

import {useAppState} from "contexts/app-state";
import {addToast} from "contexts/reducers/change-toaster";

import {formatNumberToCurrency} from "helpers/formatNumber";
import {parseTransaction} from "helpers/transactions";

import {TransactionStatus} from "interfaces/enums/transaction-status";
import {TransactionTypes} from "interfaces/enums/transaction-types";

import {useAuthentication} from "x-hooks/use-authentication";

import {addTx, updateTx} from "../../../contexts/reducers/change-tx-list";
import {MetamaskErrors} from "../../../interfaces/enums/Errors";
import {SimpleBlockTransactionPayload} from "../../../interfaces/transaction";
import NetworkTxButtonView from "./view";


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
  buttonConfirmRef?: MutableRefObject<HTMLButtonElement>
  children?: ReactChild | ReactChild[];
  disabled?: boolean;
  txType: TransactionTypes;
  txCurrency: string;
  fullWidth?: boolean;
  className?: string;
}

export default function NetworkTxButton({
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
    handleEvent,
    buttonConfirmRef
  }: NetworkTxButtonParams) {
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
      <NetworkTxButtonView 
        modalTitle={modalTitle} 
        modalDescription={modalDescription} 
        buttonLabel={buttonLabel} 
        disabled={disabled} 
        makeTx={makeTx} 
        buttonClass={getButtonClass()} 
        showModal={showModal}
        modalFooter={modalFooter} 
        divClassName={getDivClass()} 
        txSuccess={txSuccess}   
        ref={buttonConfirmRef}
      />
  );
}