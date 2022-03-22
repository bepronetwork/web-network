import { ComponentPropsWithoutRef, useContext, useState } from "react";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import Modal from "components/modal";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useNetwork } from "contexts/network";
import { addTransaction } from "contexts/reducers/add-transaction";
import { updateTransaction } from "contexts/reducers/update-transaction";

import { formatNumberToString } from "helpers/formatNumber";
import { truncateAddress } from "helpers/truncate-address";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";

import { BeproService } from "services/bepro-service";

import useTransactions from "x-hooks/useTransactions";

interface Props extends ComponentPropsWithoutRef<"div"> {
  amount: string;
  address: string;
  onConfirm?(status: boolean): void;
}

export default function OraclesTakeBackItem({
  amount = "",
  address = "",
  onConfirm = () => {}
}: Props): JSX.Element {
  const { t } = useTranslation("common");

  const [show, setShow] = useState<boolean>(false);

  const txWindow = useTransactions();
  const { activeNetwork } = useNetwork();
  const { dispatch } = useContext(ApplicationContext);
  const { updateWalletBalance } = useAuthentication();

  function handleShow() {
    setShow(true);
  }

  function handleCancel() {
    setShow(false);
  }

  async function handleTakeBack() {
    handleCancel();

    const delegateTx = addTransaction({
        type: TransactionTypes.takeBackOracles,
        amount: +amount,
        currency: "Oracles"
    },
                                      activeNetwork);
    dispatch(delegateTx);

    try {
      BeproService.network.unlock(+amount, address).then((txInfo) => {
        txWindow.updateItem(delegateTx.payload.id,
                            BeproService.parseTransaction(txInfo, delegateTx.payload));

        onConfirm(!!txInfo.status);
        updateWalletBalance();
      });
      // BeproService.parseTransaction(txInfo, delegateTx.payload)
      //             .then((block) => {
      //               dispatch(updateTransaction(block));
      //               onConfirm(txInfo.status);
      //             }))
    } catch (error) {
      updateWalletBalance();
      console.error("OraclesTakeBackItem handleTakeBack", error);
      if (error?.message?.search("User denied") > -1)
        dispatch(updateTransaction({ ...(delegateTx as any), remove: true }));
      else
        dispatch(updateTransaction({
            ...(delegateTx.payload as any),
            status: TransactionStatus.failed
        }));
    }
  }

  return (
    <>
      <div className="bg-dark-gray w-100 mb-1 p-3 border-radius-8">
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="caption-large text-purple mb-1 text-uppercase">
              {formatNumberToString(amount, 2)} {t("$oracles")}
            </p>
            <p className="caption-small text-white mb-0">{address}</p>
          </div>
          <div className="col-md-6 d-flex justify-content-end">
            <Button color="purple" outline onClick={handleShow}>
              {t("actions.take-back")}
            </Button>
          </div>
        </div>
      </div>
      <Modal
        show={show}
        title={t("actions.take-back")}
        titlePosition="center"
        onCloseClick={handleCancel}
        footer={
          <>
            <Button onClick={handleTakeBack}>{t("actions.confirm")}</Button>
            <Button color="dark-gray" onClick={handleCancel}>
              {t("actions.cancel")}
            </Button>
          </>
        }
      >
        <p className="text-center h4">
          <span className="me-2">{t("actions.take-back")}</span>
          <span className="text-purple me-2">
            {formatNumberToString(amount, 2)} {t("$oracles")}
          </span>
          <span>
            {t("misc.from")} {truncateAddress(address, 12, 3)}
          </span>
        </p>
      </Modal>
    </>
  );
}
