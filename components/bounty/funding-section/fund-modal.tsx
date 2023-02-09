import {useEffect, useState} from "react";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import FundingProgress from "components/bounty/funding-section/funding-progress";
import {Amount, CaptionMedium, RowWithTwoColumns} from "components/bounty/funding-section/minimals";
import Button from "components/button";
import InputWithBalance from "components/input-with-balance";
import Modal from "components/modal";

import {useAppState} from "contexts/app-state";
import {toastError, toastSuccess} from "contexts/reducers/change-toaster";

import {formatNumberToCurrency} from "helpers/formatNumber";

import {MetamaskErrors} from "interfaces/enums/Errors";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import {useBounty} from "x-hooks/use-bounty";
import useERC20 from "x-hooks/use-erc20";

export default function FundModal({
  show = false,
  onCloseClick,
}) {
  const {t} = useTranslation(["common", "funding", "bounty"]);
  const {state, dispatch} = useAppState();

  const [isExecuting, setIsExecuting] = useState(false);
  const [rewardPreview, setRewardPreview] = useState("0");
  const [amountToFund, setAmountToFund] = useState<BigNumber>();

  const { processEvent } = useApi();
  const { handleFundBounty } = useBepro();
  const { getDatabaseBounty } = useBounty();
  const { allowance, balance, decimals, setAddress, approve, updateAllowanceAndBalance } = useERC20();

  const bountyId = state.currentBounty?.data?.contractId || "XX";
  const rewardToken = state.currentBounty?.data?.rewardToken;
  const transactionalToken = state.currentBounty?.data?.transactionalToken;

  const fundBtnDisabled = [
    isExecuting,
    amountToFund?.isNaN(),
    amountToFund?.isZero(),
    amountToFund?.plus(state.currentBounty?.data?.fundedAmount).gt(state.currentBounty?.data?.fundingAmount),
    amountToFund === undefined
  ].some(c => c);
  const needsApproval = amountToFund?.gt(allowance);
  const amountNotFunded = 
    state.currentBounty?.data?.fundingAmount?.minus(state.currentBounty?.data?.fundedAmount) || BigNumber(0);

  const ConfirmBtn = {
    label: needsApproval ? t("actions.approve") : t("funding:actions.fund-bounty"),
    action: needsApproval ? handleApprove : fundBounty
  }
  
  const SubTitle = 
    <span className="caption-medium text-gray font-weight-normal">
      {t("funding:modals.fund.description")}
      <span className="text-primary text-capitalize"> {t("bounty:label")} #{bountyId}</span>
    </span>;

  function setDefaults() {
    setAmountToFund(undefined);
    setRewardPreview("0");
    updateAllowanceAndBalance();
  }

  function handleClose() {
    setDefaults();
    onCloseClick();
  }

  function fundBounty() {
    if (state.currentBounty?.data?.contractId === undefined || !amountToFund) return;

    setIsExecuting(true);

    handleFundBounty(state.currentBounty?.data.contractId, amountToFund.toFixed(), transactionalToken?.symbol, decimals)
      .then((txInfo) => {
        const { blockNumber: fromBlock } = txInfo as { blockNumber: number };
        
        return processEvent("bounty", "funded", state.Service?.network?.lastVisited, {fromBlock});
      })
      .then(() => {
        const amountFormatted = formatNumberToCurrency(amountToFund.toFixed());
        getDatabaseBounty(true);
        handleClose();

        dispatch(toastSuccess(t("funding:modals.fund.funded-x-symbol", {
          amount: amountFormatted,
          symbol: transactionalToken?.symbol
        }), t("funding:modals.fund.funded-succesfully")));
      })
      .catch(error => {
        if (error?.code === MetamaskErrors.UserRejected) return;
        
        console.debug("Failed to fund bounty", error);
        dispatch(toastError(t("funding:try-again"), t("funding:modals.fund.failed-to-fund")));
      })
      .finally(() => setIsExecuting(false));
  }

  function handleApprove() {
    setIsExecuting(true);
    approve(amountToFund.toFixed())
      .catch(error => {
        if (error?.code === MetamaskErrors.UserRejected) return;
        
        console.debug("Failed to approve", error);
      })
      .finally(() => setIsExecuting(false));
  }

  function handleSetAmountToFund(value) {
    setAmountToFund(BigNumber(value));
  }

  useEffect(() => {
    if (!state.currentBounty?.data?.fundingAmount || !state.currentBounty?.data?.rewardAmount) return;

    if (amountToFund?.lte(amountNotFunded)) {
      const preview = amountToFund
        .multipliedBy(state.currentBounty?.data?.rewardAmount)
        .dividedBy(state.currentBounty?.data.fundingAmount);

      setRewardPreview(preview.toFixed());
    } else
      setRewardPreview("0");
  }, [state.currentBounty?.data?.fundingAmount, state.currentBounty?.data?.rewardAmount, amountToFund]);

  useEffect(() => {
    if (transactionalToken?.address)
      setAddress(transactionalToken?.address);
  }, [transactionalToken?.address]);
  
  return(
    <Modal 
      title={t("funding:modals.fund.title")}
      subTitleComponent={SubTitle}
      show={show}
      onCloseClick={handleClose}
      onCloseDisabled={isExecuting}
    >
      <div className="mt-2 px-2 d-grid gap-4">
        <FundingProgress
          fundedAmount={state.currentBounty?.data?.fundedAmount?.toFixed()}
          fundingAmount={state.currentBounty?.data?.fundingAmount?.toFixed()}
          fundingTokenSymbol={transactionalToken?.symbol}
          fundedPercent={state.currentBounty?.data?.fundedPercent?.toString()}
          amountToFund={amountToFund?.toFixed()}
        />

        <InputWithBalance
          label={t("funding:modals.fund.fields.fund-amount.label")}
          value={amountToFund}
          onChange={handleSetAmountToFund}
          symbol={transactionalToken?.symbol}
          balance={balance}
          decimals={transactionalToken?.decimals || 18}
          max={BigNumber.minimum(amountNotFunded, balance)}
        />

        {BigNumber(state.currentBounty?.data?.rewardAmount || 0).gt(0) && (
          <RowWithTwoColumns
            col1={<CaptionMedium text={t("funding:reward")} color="white" />}
            col2={
              <div className="bg-dark-gray border-radius-8 py-2 px-3">
                +
                <Amount
                  amount={rewardPreview}
                  symbol={rewardToken?.symbol}
                  symbolColor="warning"
                  className="caption-large text-white font-weight-normal"
                />
              </div>
            }
          />
        )}

        <RowWithTwoColumns
          col1={
            <Button 
              color="gray" 
              outline
              onClick={handleClose}
              disabled={isExecuting}
            >
              {t("actions.cancel")}
            </Button>
          }
          col2={
            <Button
              disabled={fundBtnDisabled}
              onClick={ConfirmBtn.action}
              withLockIcon={fundBtnDisabled && !isExecuting}
              isLoading={isExecuting}
            >
              <span>{ConfirmBtn.label}</span>
            </Button>
          }
        />
      </div>
    </Modal>
  );
}