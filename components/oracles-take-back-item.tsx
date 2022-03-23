import { ComponentPropsWithoutRef, useState } from "react";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import Modal from "components/modal";

import { useAuthentication } from "contexts/authentication";

import { formatNumberToString } from "helpers/formatNumber";
import { truncateAddress } from "helpers/truncate-address";

import useBepro from "x-hooks/use-bepro";

interface Props extends ComponentPropsWithoutRef<"div"> {
  amount: string;
  address: string;
}

export default function OraclesTakeBackItem({amount = "", address = ""}: Props) {
  const { t } = useTranslation("common");

  const [show, setShow] = useState<boolean>(false);

  const {handleTakeBack} = useBepro()
  const { updateWalletBalance } = useAuthentication();

  function handleShow() {
    setShow(true);
  }

  function handleCancel() {
    setShow(false);
  }

  async function takeBack() {
    handleCancel();
    handleTakeBack(+amount, 'Oracles', address)
    .then(updateWalletBalance)
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
            <Button onClick={takeBack}>{t("actions.confirm")}</Button>
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
