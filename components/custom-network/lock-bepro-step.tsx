import { useEffect, useState } from "react";
import { ProgressBar } from "react-bootstrap";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import ArrowRightLine from "assets/icons/arrow-right-line";

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
  const { t } = useTranslation(["common", "bounty","custom-network"]);

  const [amount, setAmount] = useState<BigNumber>();
  const [isLocking, setIsLocking] = useState(false);
  const [inputError, setInputError] = useState("")
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showUnlockBepro, setShowUnlockBepro] = useState(false);
  const [settlerAllowance, setSettlerAllowance] = useState<BigNumber>();

  const { settings } = useSettings();
  const { service: DAOService } = useDAO();
  const { tokensLocked, updateTokenBalance } = useNetworkSettings();
  const { user, wallet, updateWalletBalance } = useAuthentication();
  
  const networkTokenSymbol = settings?.beproToken?.symbol || t("misc.$token");

  const balance = {
    beproAvailable: wallet?.balance?.bepro,
    oraclesAvailable: wallet?.balance?.oracles?.locked?.minus(wallet?.balance?.oracles?.delegatedToOthers),
    tokensLocked: wallet?.balance?.oracles?.locked?.toFixed(),
  };

  const amountLocked = BigNumber(tokensLocked.locked);
  const amountNeeded = BigNumber(tokensLocked.needed);

  const lockedPercent = amountLocked?.multipliedBy(100)?.dividedBy(amountNeeded);
  const lockingPercent = amount?.multipliedBy(100)?.dividedBy(amountNeeded);
  const maxPercent = BigNumber(100).minus(lockedPercent).toFixed(4);
  const maxValue = BigNumber.minimum(balance.beproAvailable, amountNeeded?.minus(amountLocked));
  const textAmountClass = amount?.gt(balance.beproAvailable) ? "danger" : "primary";
  const amountsClass = amount?.gt(maxValue) ? "danger" : "success";
  const needsAllowance = amount?.gt(settlerAllowance);
  const isLockBtnDisabled = [
    !amount,
    amount?.isZero(),
    amount?.isNaN(),
    lockedPercent?.gte(100),
    amount?.gt(maxValue)
  ].some(c => c);
  const isUnlockBtnDisabled = lockedPercent?.isZero() || lockedPercent?.isNaN();

  async function handleLock() {
    if (!DAOService || !amount) return;

    setIsLocking(true);

    DAOService.lockInRegistry(amount.toFixed())
      .then(() => 
        Promise.all([
          updateWalletBalance(),
          updateAllowance(),
          updateTokenBalance(),
          setAmount(BigNumber(0))
        ]))
      .catch(console.log)
      .finally(() => setIsLocking(false));
  }

  async function handleUnLock() {
    if (!DAOService) return;

    setIsUnlocking(true);

    DAOService.unlockFromRegistry()
      .then(() => 
        Promise.all([
          updateWalletBalance(),
          updateAllowance(),
          updateTokenBalance(),
          setAmount(BigNumber(0))
        ]))
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
    const newValue = BigNumber(params.value);
    
    if(newValue.gt(balance.beproAvailable))
      setInputError(t("bounty:errors.exceeds-allowance"))
    else if(inputError)
      setInputError("")
      
    setAmount(params.value !== "" && newValue || undefined);
  }

  function handleSetMaxValue() {
    if (lockedPercent?.lt(100)) setAmount(maxValue);
  }

  function handleApproval() {
    if (amountNeeded?.lte(0) || isApproving) return;

    setIsApproving(true)

    DAOService.approveTokenInRegistry(amount?.toFixed())
      .then(() => updateAllowance())
      .catch(console.log)
      .finally(()=> setIsApproving(false));
  }

  function updateAllowance() {
    DAOService.getAllowance(settings?.contracts?.settlerToken, wallet.address, settings?.contracts?.networkRegistry)
      .then(setSettlerAllowance).catch(() => BigNumber(0));
  }

  useEffect(() => {
    if (DAOService && wallet?.address) updateAllowance();
  }, [DAOService, wallet?.address]);

  return (
    <Step
      title={t("custom-network:steps.lock.title", { currency: networkTokenSymbol })}
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
                  { creatorAmount: formatNumberToNScale(amountNeeded?.toNumber()), currency: networkTokenSymbol })}
              </span>
            </div>

            <div className="row mx-0 mb-4">
              <div className="col mr-3">
                <div className="row">
                  <div className="col px-0">
                    <div className="row mb-2">
                      <label htmlFor="" className="caption-medium text-gray">
                        <span className="text-primary">{networkTokenSymbol}</span>{" "}
                        {t("transactions.amount")}
                      </label>
                    </div>

                    <div className="row mx-0 bg-dark-gray border-radius-8 amount-input">
                      <div className="col px-0">
                        <InputNumber
                          classSymbol={"text-primary"}
                          max={maxValue?.toFixed()}
                          value={amount?.toFixed()}
                          error={amount?.gt(maxValue) || !!inputError}
                          setMaxValue={handleSetMaxValue}
                          min={0}
                          placeholder={"0"}
                          disabled={!!lockedPercent?.gte(100)}
                          thousandSeparator
                          decimalSeparator="."
                          decimalScale={18}
                          onValueChange={handleAmountChange}
                          helperText={
                            <>
                            {inputError && <p className="p-small my-2 mx-2">{inputError}</p>}
                            </>
                          }
                        />

                        <div className="d-flex caption-small justify-content-between align-items-center p-3 mt-1 mb-1">
                          <span className="text-ligth-gray">
                            <span className="text-primary">{networkTokenSymbol}</span>{" "}
                            {t("misc.available")}
                          </span>

                          <div className="d-flex align-items-center">
                            <span className="text-gray">
                              {formatNumberToCurrency(balance?.beproAvailable?.toNumber() || 0, {
                                maximumFractionDigits: 18
                              })}
                            </span>

                            {amount?.gt(0) && (
                              <>
                                <span
                                  className={`${textAmountClass} ml-1 d-flex align-items-center`}
                                >
                                  <ArrowRightLine />
                                </span>

                                <span className={`${textAmountClass} ml-1`}>
                                  {formatNumberToCurrency(balance?.beproAvailable?.minus(amount)?.toNumber())}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {(balance?.oraclesAvailable?.gt(0) && lockedPercent?.lt(100)) && (
                      <>
                        <div className="row mt-4">
                          <p className="caption-small text-gray">
                            {t("transactions.types.unlock")}{" "}
                            <span className="text-primary">{networkTokenSymbol}</span>{" "}
                            {t("misc.by")} {t("misc.giving-away")}{" "}
                            <span className="text-purple">
                              {t("$oracles", { token: networkTokenSymbol })}
                            </span>
                          </p>
                        </div>

                        <div
                          className={`row mt-2 bg-dark-gray bg-dark-hover cursor-pointer 
                            border-radius-8 caption-small p-3`}
                          onClick={handleShowUnlockModal}
                        >
                          <div className="d-flex justify-content-between px-0">
                            <span className="text-ligth-gray">
                              <span className="text-purple text-uppercase">
                                {t("$oracles", { token: networkTokenSymbol })}
                              </span>{" "}
                              {t("misc.available")}
                            </span>

                            <span className="text-gray">
                              {formatNumberToCurrency(balance?.oraclesAvailable?.toNumber() || 0, {
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
                  <span className="text-primary">{networkTokenSymbol}</span>{" "}
                  {t("misc.locked")}
                </p>
                <div className="d-flex justify-content-between caption-large mb-3 amount-input">
                  <AmountWithPreview
                    amount={amountLocked?.toFixed()}
                    amountColor={(lockedPercent?.gte(100) && "success") || "white"}
                    preview={amountLocked?.plus(amount || 0)?.toFixed()}
                    previewColor={amountsClass}
                    type="currency"
                  />

                  <AmountWithPreview
                    amount={lockedPercent?.gte(100) && t("custom-network:steps.lock.full") || amountNeeded?.toFixed()}
                    amountColor={(lockedPercent?.gte(100) && "success") || "gray"}
                    type="currency"
                  />
                </div>

                <div className="row justify-content-between caption-large mb-3">
                  <ProgressBar>
                    <ProgressBar
                      variant={amountsClass}
                      now={lockingPercent?.gt(maxPercent) ? 100 : lockedPercent?.toNumber()}
                      isChild
                    />

                    <ProgressBar
                      min={0}
                      now={(lockingPercent?.gt(maxPercent) ? 0 : lockingPercent?.toNumber()) || 0}
                      isChild
                    />
                  </ProgressBar>
                </div>

                <div className="d-flex align-items-center caption-large amount-input">
                  <AmountWithPreview
                    amount={lockedPercent?.toFixed()}
                    amountColor={(lockedPercent?.gte(100) && "success") || "white"}
                    preview={lockingPercent?.plus(lockedPercent)?.toFixed()}
                    previewColor={amountsClass}
                    type="percent"
                  />
                </div>

                <div className="d-flex justify-content-center mt-4 pt-3">
                  {
                    needsAllowance &&
                    <Button disabled={isApproving || !!lockingPercent?.gt(100)} onClick={handleApproval}>
                      {t('actions.approve')}
                      {isApproving && <span className="spinner-border spinner-border-xs ml-1" />}
                    </Button>
                    ||
                    <Button
                      disabled={isLockBtnDisabled || isLocking}
                      onClick={() => handleLock()}
                      isLoading={isLocking}
                      withLockIcon={!isLocking && isLockBtnDisabled}
                    >
                      <span>
                        {t("transactions.types.lock")} {networkTokenSymbol}
                      </span>
                    </Button>
                  }

                  <Button
                    disabled={isUnlockBtnDisabled || isUnlocking || isApproving || isLocking }
                    color="ligth-gray"
                    onClick={handleUnLock}
                    isLoading={isUnlocking}
                    withLockIcon={!isUnlocking && isUnlockBtnDisabled}
                  >
                    <span>{t('transactions.types.unlock')}</span>
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
        networkTokenSymbol={networkTokenSymbol}
      />
    </Step>
  );
}
