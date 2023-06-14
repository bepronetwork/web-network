import {useEffect, useState} from "react";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import {useAppState} from "contexts/app-state";
import {toastError, toastSuccess} from "contexts/reducers/change-toaster";

import {formatNumberToCurrency} from "helpers/formatNumber";

import {MetamaskErrors} from "interfaces/enums/Errors";
import { NetworkEvents } from "interfaces/enums/events";
import { IssueBigNumberData } from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useERC20 from "x-hooks/use-erc20";

import FundModalView from "./view";

interface FundModalProps {
  show?: boolean,
  onCloseClick?: () => void;
  currentBounty: IssueBigNumberData;
  updateBountyData: () => void;
}

export default function FundModal({
  show = false,
  onCloseClick,
  currentBounty,
  updateBountyData
}: FundModalProps) {
  const {t} = useTranslation(["common", "funding", "bounty"]);
  const {dispatch} = useAppState();

  const [isExecuting, setIsExecuting] = useState(false);
  const [rewardPreview, setRewardPreview] = useState("0");
  const [amountToFund, setAmountToFund] = useState<BigNumber>();

  const { processEvent } = useApi();
  const { handleFundBounty } = useBepro();
  const { allowance, balance, decimals, setAddress, approve, updateAllowanceAndBalance } = useERC20();

  const rewardToken = currentBounty?.rewardToken;
  const transactionalToken = currentBounty?.transactionalToken;

  const fundBtnDisabled = [
    isExecuting,
    amountToFund?.isNaN(),
    amountToFund?.isZero(),
    amountToFund?.plus(currentBounty?.fundedAmount).gt(currentBounty?.fundingAmount),
    amountToFund === undefined
  ].some(c => c);
  const needsApproval = amountToFund?.gt(allowance);
  const amountNotFunded = 
    currentBounty?.fundingAmount?.minus(currentBounty?.fundedAmount) || BigNumber(0);

  const ConfirmBtn = {
    label: needsApproval ? t("actions.approve") : t("funding:actions.fund-bounty"),
    action: needsApproval ? handleApprove : fundBounty
  }

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
    if (currentBounty?.contractId === undefined || !amountToFund) return;

    setIsExecuting(true);

    handleFundBounty(currentBounty.contractId, amountToFund.toFixed(), transactionalToken?.symbol, decimals)
      .then((txInfo) => {
        const { blockNumber: fromBlock } = txInfo as { blockNumber: number };
        
        return processEvent(NetworkEvents.BountyFunded, undefined, {fromBlock});
      })
      .then(async () => {
        const amountFormatted = formatNumberToCurrency(amountToFund.toFixed());
        
        updateAllowanceAndBalance();
        updateBountyData();
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
    const newAmountToFund = BigNumber(value);

    if (newAmountToFund?.lte(amountNotFunded)) {
      const preview = newAmountToFund
        .multipliedBy(currentBounty?.rewardAmount)
        .dividedBy(currentBounty.fundingAmount);

      setRewardPreview(preview.toFixed());
    } else setRewardPreview("0");

    setAmountToFund(newAmountToFund);
  }

  useEffect(() => {
    if (transactionalToken?.address)
      setAddress(transactionalToken?.address);
  }, [transactionalToken?.address]);
  
  return (
    <FundModalView
      show={show}
      handleClose={handleClose}
      bounty={currentBounty}
      transactionalToken={transactionalToken}
      rewardToken={rewardToken}
      handleSetAmountToFund={handleSetAmountToFund}
      amountNotFunded={amountNotFunded}
      balance={balance}
      fundBtnDisabled={fundBtnDisabled}
      confirmBtn={ConfirmBtn}
      isExecuting={isExecuting}
      rewardPreview={rewardPreview}
      amountToFund={amountToFund}
    />
  );
}