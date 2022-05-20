import { useEffect, useState } from "react";
import { ProgressBar } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import ArrowRightLine from "assets/icons/arrow-right-line";
import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import InputNumber from "components/input-number";
import Step from "components/step";
import UnlockBeproModal from "components/unlock-bepro-modal";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";

import { formatNumberToCurrency, formatNumberToNScale } from "helpers/formatNumber";

const { publicRuntimeConfig } = getConfig();

export default function LockBeproStep({
  data,
  step,
  balance,
  currentStep,
  handleChange,
  handleChangeStep,
  creatorAmount = 0
}) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [isLocking, setIsLocking] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showUnlockBepro, setShowUnlockBepro] = useState(false);
  const [networkTokenName, setNetworkTokenName] = useState<string>(t("misc.token"));
  const [settlerAllowance, setSettlerAllowance] = useState(0);

  const { service: DAOService } = useDAO();
  const { wallet, updateWalletBalance } = useAuthentication();

  const lockedPercent =
    ((data.amountLocked || 0) / (data.amountNeeded || 0)) * 100;
  const lockingPercent = ((data.amount || 0) / (data.amountNeeded || 0)) * 100;
  const maxPercent = 100 - lockedPercent;
  const maxValue = Math.min(balance.beproAvailable,
                            +data.amountNeeded - +data.amountLocked);
  const textAmountClass =
    data.amount > balance.beproAvailable ? "text-danger" : "text-primary";
  const amountsClass = data.amount > maxValue ? "danger" : "success";
  const needsAllowance = data.amount > settlerAllowance;

  async function handleLock() {
    if (!DAOService) return;

    setIsLocking(true);

    try {
      const amount = data.amount;

      DAOService.lockInFactory(amount)
        .then(() => {
          handleChange({ label: "amountLocked", value: amount });
          handleChange({ label: "amount", value: 0 });
          updateWalletBalance();
        })
        .catch(console.log)
        .finally(() => setIsLocking(false));
    } catch (error) {
      console.log(error);
      setIsLocking(false);
    }
  }

  async function handleUnLock() {
    if (!DAOService) return;
    
    setIsUnlocking(true);

    DAOService.unlockFromFactory()
      .then(() => {
        handleChange({ label: "amountLocked", value: 0 });
        handleChange({ label: "amount", value: 0 });
        updateWalletBalance();
        updateAllowance();
      })
      .catch((error) => {
        console.log("Failed to Unlock", error);
      })
      .finally(() => setIsUnlocking(false));
  }

  function handleShowUnlockModal() {
    setShowUnlockBepro(true);
  }

  function handleCloseUnlockModal() {
    setShowUnlockBepro(false);
  }

  function handleApproval() {
    if (data.amountNeeded <= 0) return;

    DAOService.approveTokenInFactory(data.amountNeeded - settlerAllowance)
      .then(() => {
        updateWalletBalance();
        updateAllowance();
      })
      .catch(console.log);
  }

  function updateAllowance() {  
    DAOService.getAllowance(publicRuntimeConfig?.contract?.settler,
                            wallet.address, 
                            publicRuntimeConfig?.networkConfig?.factoryAddress)
    .then(setSettlerAllowance).catch(() => 0);
  }

  useEffect(() => {
    if (!DAOService || !wallet?.address) return;
    
    DAOService.getSettlerTokenData().then(data => setNetworkTokenName(data.symbol));
    
    updateAllowance();
  }, [DAOService, wallet]);

  return (
    <Step
      title={t("custom-network:steps.lock.title", { currency: networkTokenName })}
      index={step}
      activeStep={currentStep}
      validated={data.validated}
      handleClick={handleChangeStep}
    >
      <div className="row mb-4">
        <span className="caption-small text-gray">
          {t("custom-network:steps.lock.you-need-to-lock", 
            { creatorAmount: formatNumberToNScale(creatorAmount), currency: networkTokenName })}
        </span>
      </div>

      <div className="row mx-0 mb-4">
        <div className="col mr-3">
          <div className="row">
            <div className="col px-0">
              <div className="row mb-2">
                <label htmlFor="" className="caption-medium text-gray">
                  <span className="text-primary">{networkTokenName}</span>{" "}
                  {t("transactions.amount")}
                </label>
              </div>

              <div className="row mx-0 bg-dark-gray border-radius-8 amount-input">
                <InputNumber
                  classSymbol={"text-primary"}
                  max={maxValue}
                  value={data.amount}
                  error={data.amount > maxValue}
                  setMaxValue={() =>
                    handleChange({ label: "amount", value: maxValue })
                  }
                  min={0}
                  placeholder={"0"}
                  thousandSeparator
                  decimalSeparator="."
                  decimalScale={18}
                  onValueChange={(params) =>
                    handleChange({ label: "amount", value: params.floatValue })
                  }
                />

                <div className="d-flex caption-small justify-content-between align-items-center p-20">
                  <span className="text-ligth-gray">
                    <span className="text-primary">{networkTokenName}</span>{" "}
                    {t("misc.available")}
                  </span>

                  <div className="d-flex align-items-center">
                    <span className="text-gray">
                      {formatNumberToCurrency(balance.beproAvailable || 0, {
                        maximumFractionDigits: 18
                      })}
                    </span>

                    {data.amount > 0 && (
                      <>
                        <span
                          className={`${textAmountClass} ml-1 d-flex align-items-center`}
                        >
                          <ArrowRightLine />
                        </span>

                        <span className={`${textAmountClass} ml-1`}>
                          {formatNumberToCurrency(parseFloat(balance.beproAvailable) -
                              parseFloat(data.amount))}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {balance.oraclesAvailable > 0 && (
                <>
                  <div className="row mt-4">
                    <p className="caption-small text-gray">
                      {t("transactions.types.unlock")}{" "}
                      <span className="text-primary">{networkTokenName}</span>{" "}
                      {t("misc.by")} {t("misc.giving-away")}{" "}
                      <span className="text-purple">{t("$oracles")}</span>
                    </p>
                  </div>

                  <div
                    className="row mt-2 bg-dark-gray bg-dark-hover cursor-pointer border-radius-8 caption-small p-20"
                    onClick={handleShowUnlockModal}
                  >
                    <div className="d-flex justify-content-between px-0">
                      <span className="text-ligth-gray">
                        <span className="text-purple text-uppercase">
                          {t("$oracles")}
                        </span>{" "}
                        {t("misc.available")}
                      </span>

                      <span className="text-gray">
                        {formatNumberToCurrency(balance.oraclesAvailable || 0, {
                          maximumFractionDigits: 18
                        })}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col bg-dark-gray border-radius-8 p-20">
          <p className="caption-medium text-gray mb-4">
            <span className="text-primary">{networkTokenName}</span>{" "}
            {t("misc.locked")}
          </p>

          <div className="d-flex justify-content-between caption-large mb-3 amount-input">
            <div className="d-flex align-items-center">
              <span
                className={`text-${
                  (lockedPercent >= 100 && "success") || "white"
                } mr-1`}
              >
                {formatNumberToCurrency(data.amountLocked || 0, {
                  maximumFractionDigits: 18
                })}
              </span>

              {data.amount > 0 && (
                <div className={`text-${amountsClass}`}>
                  <ArrowRightLine />

                  <span className="ml-1">
                    {formatNumberToCurrency(parseFloat(data.amountLocked) + parseFloat(data.amount))}
                  </span>
                </div>
              )}
            </div>

            <span
              className={`text-${
                (lockedPercent >= 100 && "success") || "gray"
              }`}
            >
              {(lockedPercent >= 100 && "full") ||
                formatNumberToCurrency(data.amountNeeded || 0, {
                  maximumFractionDigits: 18
                })}
            </span>
          </div>

          <div className="row justify-content-between caption-large mb-3">
            <ProgressBar>
              <ProgressBar
                variant={amountsClass}
                now={lockingPercent > maxPercent ? 100 : lockedPercent}
                isChild
              />

              <ProgressBar
                min={0}
                now={lockingPercent > maxPercent ? 0 : lockingPercent}
                isChild
              />
            </ProgressBar>
          </div>

          <div className="d-flex align-items-center caption-large text-white amount-input">
            <span
              className={`text-${
                (lockedPercent >= 100 && "success") || "white"
              } mr-1`}
            >
              {formatNumberToCurrency(lockedPercent, {
                maximumFractionDigits: 2
              })}
              %
            </span>

            {data.amount > 0 && (
              <div className={`text-${amountsClass}`}>
                <ArrowRightLine />

                <span className="ml-1">
                  {formatNumberToCurrency(lockingPercent + lockedPercent, {
                    maximumFractionDigits: 2
                  })}
                  %
                </span>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-center mt-4 pt-3">
            {
              needsAllowance && 
              <Button onClick={handleApproval}>
                {t('actions.approve')}
              </Button>
              ||
              <Button
              disabled={
                !(data.amount > 0) ||
                lockedPercent >= 100 ||
                data.amount > maxValue ||
                isLocking
              }
              onClick={() => handleLock()}
            >
              {!isLocking &&
                (!(data.amount > 0) ||
                  lockedPercent >= 100 ||
                  data.amount > maxValue) && (
                  <LockedIcon width={12} height={12} className="mr-1" />
                )}
              <span>
                {t("transactions.types.lock")} {networkTokenName}
              </span>
              {isLocking ? (
                <span className="spinner-border spinner-border-xs ml-1" />
              ) : (
                ""
              )}
            </Button> 
            }

            <Button disabled={lockedPercent === 0 || isUnlocking} color="ligth-gray" onClick={handleUnLock}>
              {!isUnlocking || lockedPercent === 0 && (
                <LockedIcon width={12} height={12} className="mr-1" />
              )}
                {t('transactions.types.unlock')}
              {isUnlocking ? (
                <span className="spinner-border spinner-border-xs ml-1" />
              ) : (
                ''
              )}
            </Button>
          </div>
        </div>
      </div>

      <UnlockBeproModal
        show={showUnlockBepro}
        onCloseClick={handleCloseUnlockModal}
      />
    </Step>
  );
}
