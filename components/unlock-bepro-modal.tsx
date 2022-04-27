import { useRef, useState } from "react";

import { useTranslation } from "next-i18next";

import ArrowRightLine from "assets/icons/arrow-right-line";
import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import InputNumber from "components/input-number";
import Modal from "components/modal";
import NetworkTxButton from "components/network-tx-button";

import { useAuthentication } from "contexts/authentication";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { TransactionTypes } from "interfaces/enums/transaction-types";

export default function UnlockBeproModal({
  show = false,
  onCloseClick,
}) {
  const { t } = useTranslation(["common", "pull-request"]);

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [amountToUnlock, setAmountToUnlock] = useState(0);

  const networkTxRef = useRef<HTMLButtonElement>(null);

  const { wallet, updateWalletBalance } = useAuthentication();

  const oraclesAvailable =
    wallet?.balance?.oracles?.tokensLocked -
    wallet?.balance?.oracles?.delegatedToOthers;
  const textOracleClass =
    amountToUnlock > oraclesAvailable ? "text-danger" : "text-purple";
  const textBeproClass =
    amountToUnlock > oraclesAvailable ? "text-danger" : "text-success";

  function isButtonDisabled(): boolean {
    return (
      amountToUnlock < 1 || isUnlocking || amountToUnlock > oraclesAvailable
    );
  }

  function setDefaults() {
    updateWalletBalance();
    onCloseClick?.();
    setAmountToUnlock(0);
    setIsUnlocking(false);
  }

  function setToMax() {
    setAmountToUnlock(wallet?.balance?.oracles?.tokensLocked -
        wallet?.balance?.oracles?.delegatedToOthers);
  }

  function handleChange({ floatValue }) {
    setAmountToUnlock(floatValue);
  }

  function handleUnlock() {
    setIsUnlocking(true);
    networkTxRef.current.click();
  }

  return (
    <Modal
      titleComponent={
        <>
          {t("transactions.types.unlock")}{" "}
          <span className="text-primary">{t("$bepro")}</span>
        </>
      }
      show={show}
      onCloseClick={setDefaults}
      titlePosition="center"
    >
      <div className="container">
        <div className="mb-3">
          <p className="caption-medium text-gray mb-2">
            <span className="text-purple">{t("$oracles")}</span>{" "}
            {t("transactions.amount")}
          </p>

          <div className="row mx-0 bg-dark-gray border-radius-8 amount-input">
            <InputNumber
              classSymbol={"text-purple"}
              max={oraclesAvailable}
              value={amountToUnlock}
              error={amountToUnlock > oraclesAvailable}
              setMaxValue={setToMax}
              min={0}
              placeholder={"0"}
              thousandSeparator
              decimalSeparator="."
              decimalScale={18}
              onValueChange={handleChange}
            />

            <div className="d-flex caption-small justify-content-between align-items-center p-20">
              <span className="text-ligth-gray">
                <span className="text-purple">{t("$oracles")}</span>{" "}
                {t("misc.available")}
              </span>

              <div className="d-flex align-items-center">
                <span className="text-gray">
                  {formatNumberToCurrency(oraclesAvailable, {
                    maximumFractionDigits: 18
                  })}
                </span>

                {amountToUnlock > 0 && (
                  <>
                    <span
                      className={`${textOracleClass} ml-1 d-flex align-items-center`}
                    >
                      <ArrowRightLine />
                    </span>

                    <span className={`${textOracleClass} ml-1`}>
                      {formatNumberToCurrency(oraclesAvailable - amountToUnlock)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex mb-2 caption-small bg-dark-gray justify-content-between border-radius-8 align-items-center p-20 amount-input">
          <span className="text-ligth-gray">
            <span className="text-primary">{t("$bepro")}</span>{" "}
            {t("misc.available")}
          </span>

          <div className="d-flex align-items-center">
            <span className="text-gray">
              {formatNumberToCurrency(wallet?.balance?.bepro, {
                maximumFractionDigits: 2
              })}
            </span>

            {amountToUnlock > 0 && (
              <>
                <span
                  className={`${textBeproClass} ml-1 d-flex align-items-center`}
                >
                  <ArrowRightLine />
                </span>

                <span className={`${textBeproClass} ml-1`}>
                  {formatNumberToCurrency(wallet?.balance?.bepro + amountToUnlock,
                                          {
                      maximumFractionDigits: 2
                                          })}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="d-flex pt-2 justify-content-center">
          <Button
            className="mr-2"
            disabled={isButtonDisabled()}
            onClick={handleUnlock}
          >
            {isButtonDisabled() && !isUnlocking && (
              <LockedIcon className="me-2" />
            )}
            <span>
              {t("transactions.types.unlock")}{" "}
              {!isButtonDisabled() &&
                amountToUnlock > 0 &&
                formatNumberToCurrency(amountToUnlock, {
                  maximumFractionDigits: 2
                })}{" "}
              {t("$bepro")}
            </span>
            {isUnlocking ? (
              <span className="spinner-border spinner-border-xs ml-1" />
            ) : (
              ""
            )}
          </Button>
        </div>
      </div>

      <NetworkTxButton
        txMethod="unlock"
        txType={TransactionTypes.unlock}
        txCurrency={t("$oracles")}
        txParams={{
          tokenAmount: amountToUnlock,
          from: wallet?.address
        }}
        buttonLabel=""
        modalTitle={t("my-oracles:actions.unlock.title")}
        modalDescription={t("my-oracles:actions.unlock.description")}
        onSuccess={setDefaults}
        onFail={(e) => {console.error('error', e)}}
        ref={networkTxRef}
      />
    </Modal>
  );
}
