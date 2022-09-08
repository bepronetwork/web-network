import { useEffect, useState } from "react";
import { ProgressBar } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import ArrowRightLine from "assets/icons/arrow-right-line";
import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import ConnectGithub from "components/connect-github";
import AmountWithPreview from "components/custom-network/amount-with-preview";
import InputNumber from "components/input-number";
import Step from "components/step";
import UnlockBeproModal from "components/unlock-bepro-modal";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetworkSettings } from "contexts/network-settings";
import { useSettings } from "contexts/settings";

import { formatNumberToCurrency, formatNumberToNScale } from "helpers/formatNumber";

import { StepWrapperProps } from "interfaces/stepper";

export default function LockBeproStep({ activeStep, index, handleClick, validated }: StepWrapperProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [amount, setAmount] = useState(0);
  const [isApproving, setIsApproving] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [settlerAllowance, setSettlerAllowance] = useState(0);
  const [showUnlockBepro, setShowUnlockBepro] = useState(false);

  const { settings } = useSettings();
  const { service: DAOService } = useDAO();
  const { tokensLocked } = useNetworkSettings();
  const { user, wallet, updateWalletBalance } = useAuthentication();

  const networkTokenName = settings?.beproToken?.symbol || t("misc.$token");

  const balance = {
    beproAvailable: wallet?.balance?.bepro,
    oraclesAvailable: +wallet?.balance?.oracles?.tokensLocked - wallet?.balance?.oracles?.delegatedToOthers,
    tokensLocked: wallet?.balance?.oracles?.tokensLocked,
  };

  const amountLocked = tokensLocked.locked;
  const amountNeeded = tokensLocked.needed;

  const lockedPercent = (amountLocked / amountNeeded) * 100;
  const lockingPercent = (amount / amountNeeded) * 100;
  const maxPercent = 100 - lockedPercent;
  const maxValue = Math.min(balance.beproAvailable, amountNeeded - amountLocked);
  const textAmountClass = amount > balance.beproAvailable ? "danger" : "primary";
  const amountsClass = amount > maxValue ? "danger" : "success";
  const needsAllowance = amount > settlerAllowance;

  async function handleLock() {
    if (!DAOService || !amount) return;

    setIsLocking(true);

    DAOService.lockInRegistry(amount)
      .then(() => {
        setAmount(0);
        updateWalletBalance();
      })
      .catch(console.log)
      .finally(() => setIsLocking(false));
  }

  async function handleUnLock() {
    if (!DAOService) return;

    setIsUnlocking(true);

    DAOService.unlockFromRegistry()
      .then(() => {
        setAmount(0);
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

  function handleAmountChange(params) {
    setAmount(params.floatValue);
  }

  function handleSetMaxValue() {
    setAmount(maxValue);
  }

  function handleApproval() {
    if (amountNeeded <= 0|| isApproving) return;
    setIsApproving(true)
    DAOService.approveTokenInRegistry(amountNeeded - settlerAllowance)
      .then(() => {
        updateWalletBalance();
        updateAllowance();
      })
      .catch(console.log).finally(()=> setIsApproving(false))
  }

  function updateAllowance() {
    DAOService.getAllowance(settings?.contracts?.settlerToken, wallet.address, settings?.contracts?.networkRegistry)
      .then(setSettlerAllowance).catch(() => 0);
  }

  useEffect(() => {
    if (DAOService && wallet?.address) updateAllowance();
  }, [DAOService, wallet?.address]);

  return (
    <Step
      title={t("custom-network:steps.lock.title", { currency: networkTokenName })}
      index={index}
      activeStep={activeStep}
      validated={validated && !!user?.login}
      handleClick={handleClick}
    >
      {(!user?.login ?
        (
          <div className="pt-3">
            <ConnectGithub />
          </div>
        ) :
        (
          <>
            <div className="row mb-4">
              <span className="caption-small text-gray">
                {t("custom-network:steps.lock.you-need-to-lock",
                  { creatorAmount: formatNumberToNScale(amountNeeded), currency: networkTokenName })}
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
                      <div className="col px-0">
                        <InputNumber
                          classSymbol={"text-primary"}
                          max={maxValue}
                          value={amount}
                          error={amount > maxValue}
                          setMaxValue={handleSetMaxValue}
                          min={0}
                          placeholder={"0"}
                          thousandSeparator
                          decimalSeparator="."
                          decimalScale={18}
                          onValueChange={handleAmountChange}
                        />

                        <div className="d-flex caption-small justify-content-between align-items-center p-3 mt-1 mb-1">
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

                            {amount > 0 && (
                              <>
                                <span
                                  className={`${textAmountClass} ml-1 d-flex align-items-center`}
                                >
                                  <ArrowRightLine />
                                </span>

                                <span className={`${textAmountClass} ml-1`}>
                                  {formatNumberToCurrency(balance.beproAvailable - amount)}
                                </span>
                              </>
                            )}
                          </div>
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
                          className="row mt-2 bg-dark-gray bg-dark-hover cursor-pointer border-radius-8 caption-small p-3"
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

              <div className="col bg-dark-gray border-radius-8 p-3">
                <p className="caption-medium text-gray mb-4">
                  <span className="text-primary">{networkTokenName}</span>{" "}
                  {t("misc.locked")}
                </p>

                <div className="d-flex justify-content-between caption-large mb-3 amount-input">
                  <AmountWithPreview
                    amount={amountLocked}
                    amountColor={(lockedPercent >= 100 && "success") || "white"}
                    preview={amountLocked + amount}
                    previewColor={amountsClass}
                    type="currency"
                  />

                  <AmountWithPreview
                    amount={lockedPercent >= 100 && t("custom-network:steps.lock.full") || amountNeeded}
                    amountColor={(lockedPercent >= 100 && "success") || "gray"}
                    type="currency"
                  />
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

                <div className="d-flex align-items-center caption-large amount-input">
                  <AmountWithPreview
                    amount={lockedPercent}
                    amountColor={(lockedPercent >= 100 && "success") || "white"}
                    preview={lockingPercent + lockedPercent}
                    previewColor={amountsClass}
                    type="percent"
                  />
                </div>

                <div className="d-flex justify-content-center mt-4 pt-3">
                  {
                    needsAllowance &&
                    <Button disabled={isApproving} onClick={handleApproval}>
                      {t('actions.approve')}
                      {isApproving && <span className="spinner-border spinner-border-xs ml-1" />}
                    </Button>
                    ||
                    <Button
                      disabled={
                        !(amount > 0) ||
                        lockedPercent >= 100 ||
                        amount > maxValue ||
                        isLocking
                      }
                      onClick={() => handleLock()}
                    >
                      {!isLocking &&
                        (!(amount > 0) ||
                          lockedPercent >= 100 ||
                          amount > maxValue) && (
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
          </>
        )
      )}

      <UnlockBeproModal
        show={showUnlockBepro}
        onCloseClick={handleCloseUnlockModal}
      />
    </Step>
  );
}
