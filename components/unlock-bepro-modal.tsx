import {useState} from "react";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import ArrowRightLine from "assets/icons/arrow-right-line";

import ContractButton from "components/contract-button";
import InputNumber from "components/input-number";
import Modal from "components/modal";


import {useAppState} from "contexts/app-state";

import {formatStringToCurrency} from "helpers/formatNumber";

import { NetworkEvents } from "interfaces/enums/events";
import {TransactionTypes} from "interfaces/enums/transaction-types";

import useApi from "x-hooks/use-api";
import {useAuthentication} from "x-hooks/use-authentication";

import NetworkTxButton from "./common/network-tx-button/controller";

export default function UnlockBeproModal({
  show = false,
  onCloseClick,
  networkTokenSymbol
}) {
  const { t } = useTranslation(["common", "deliverable"]);

  const [isUnlocking, setIsUnlocking] = useState(false);
  const [amountToUnlock, setAmountToUnlock] = useState<BigNumber>();

  const {state} = useAppState();

  const { processEvent } = useApi();

  const { updateWalletBalance } = useAuthentication();

  const oraclesAvailable = state.currentUser?.balance?.oracles?.locked;
  const amountExceedsAvailable = amountToUnlock?.gt(oraclesAvailable);
  const textOracleClass = amountExceedsAvailable ? "text-danger" : "text-purple";
  const textBeproClass = amountExceedsAvailable ? "text-danger" : "text-success";
  const isButtonDisabled = [
    !amountToUnlock,
    amountToUnlock?.isZero(),
    amountToUnlock?.isNaN(),
    isUnlocking,
    amountExceedsAvailable
  ].some(c => c);

  function setDefaults() {
    updateWalletBalance();
    onCloseClick?.();
    setAmountToUnlock(undefined);
    setIsUnlocking(false);
  }

  function handleError(e) {
    setDefaults();
    console.debug('error', e);
  }

  function setToMax() {
    setAmountToUnlock(state.currentUser?.balance?.oracles?.locked);
  }

  function handleChange({ value }) {
    setAmountToUnlock(BigNumber(value));
  }

  function handleProcessEvent(blockNumber) {
    processEvent(NetworkEvents.OraclesChanged, undefined, { fromBlock: blockNumber })
      .catch(console.debug);
  }

  function handleUnlock() {
    setIsUnlocking(true);
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
            <span className="text-purple">{t("$oracles",  { token: networkTokenSymbol })}</span>{" "}
            {t("transactions.amount")}
          </p>

          <div className="row mx-0 bg-dark-gray border-radius-8 amount-input">
            <InputNumber
              classSymbol={"text-purple"}
              max={oraclesAvailable?.toFixed()}
              value={amountToUnlock?.toFixed()}
              error={amountExceedsAvailable}
              setMaxValue={setToMax}
              min={0}
              placeholder={"0"}
              thousandSeparator
              decimalSeparator="."
              decimalScale={18}
              onValueChange={handleChange}
            />

            <div className="d-flex caption-small justify-content-between align-items-center p-20">
              <span className="text-light-gray">
                <span className="text-purple">
                  {t("$oracles", { token: networkTokenSymbol })}
                </span>{" "}
                {t("misc.available")}
              </span>

              <div className="d-flex align-items-center">
                <span className="text-gray">
                  {formatStringToCurrency(oraclesAvailable?.toFixed())}
                </span>

                {amountToUnlock?.gt(0) && (
                  <>
                    <span
                      className={`${textOracleClass} ml-1 d-flex align-items-center`}
                    >
                      <ArrowRightLine />
                    </span>

                    <span className={`${textOracleClass} ml-1`}>
                      {formatStringToCurrency(oraclesAvailable?.minus(amountToUnlock).toFixed())}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="
        d-flex mb-2 caption-small bg-dark-gray justify-content-between
        border-radius-8 align-items-center p-20 amount-input
                      ">
          <span className="text-light-gray">
            <span className="text-primary">{t("$bepro")}</span>{" "}
            {t("misc.available")}
          </span>

          <div className="d-flex align-items-center">
            <span className="text-gray">
              {formatStringToCurrency(state.currentUser?.balance?.bepro?.toFixed())}
            </span>

            {amountToUnlock?.gt(0) && (
              <>
                <span
                  className={`${textBeproClass} ml-1 d-flex align-items-center`}
                >
                  <ArrowRightLine />
                </span>

                <span className={`${textBeproClass} ml-1`}>
                  {formatStringToCurrency(state.currentUser?.balance?.bepro?.plus(amountToUnlock)?.toFixed())}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="d-flex pt-2 justify-content-center">
          <ContractButton
            className="mr-2"
            disabled={isButtonDisabled}
            onClick={handleUnlock}
            withLockIcon={isButtonDisabled && !isUnlocking}
            isLoading={isUnlocking}
          >
            <span>
              {t("transactions.types.unlock")}{" "}
              {!isButtonDisabled &&
                amountToUnlock?.gt(0) &&
                formatStringToCurrency(amountToUnlock?.toFixed())}{" "}
              {t("$bepro")}
            </span>
          </ContractButton>
        </div>
      </div>

      <NetworkTxButton
        txMethod="unlock"
        txType={TransactionTypes.unlock}
        txCurrency={t("$oracles",  { token: networkTokenSymbol })}
        txParams={{
          tokenAmount: amountToUnlock?.toFixed(),
          from: state.currentUser?.walletAddress
        }}
        handleEvent={handleProcessEvent}
        buttonLabel=""
        modalTitle={t("my-oracles:actions.unlock.title")}
        modalDescription={t("my-oracles:actions.unlock.description", { token: networkTokenSymbol })}
        onSuccess={setDefaults}
        onFail={handleError}
      />
    </Modal>
  );
}
