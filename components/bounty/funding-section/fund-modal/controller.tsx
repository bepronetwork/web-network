import {useEffect, useState} from "react";

import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";

import FundModalView from "components/bounty/funding-section/fund-modal/view";

import {formatNumberToCurrency} from "helpers/formatNumber";

import {MetamaskErrors} from "interfaces/enums/Errors";
import { NetworkEvents } from "interfaces/enums/events";
import { IssueBigNumberData } from "interfaces/issue-data";

import useBepro from "x-hooks/use-bepro";
import useContractTransaction from "x-hooks/use-contract-transaction";
import useERC20 from "x-hooks/use-erc20";

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
  const { t } = useTranslation(["common", "funding", "bounty"]);
  
  const [isApproving, setIsApproving] = useState(false);
  const [rewardPreview, setRewardPreview] = useState("0");
  const [amountToFund, setAmountToFund] = useState<BigNumber>();

  const { handleFundBounty } = useBepro();
  const { allowance, balance, decimals, setAddress, approve, updateAllowanceAndBalance } = useERC20();

  const transactionalToken = currentBounty?.transactionalToken;

  const [isExecuting, onFund] = useContractTransaction( NetworkEvents.BountyFunded,
                                                        handleFundBounty,
                                                        t("funding:modals.fund.funded-x-symbol", {
                                                            amount: formatNumberToCurrency(amountToFund?.toFixed()),
                                                            symbol: transactionalToken?.symbol
                                                        }),
                                                        t("funding:try-again"));

  const rewardToken = currentBounty?.rewardToken;
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

    onFund(currentBounty.contractId, amountToFund.toFixed(), transactionalToken?.symbol, decimals)
      .then(() => {
        updateAllowanceAndBalance();
        updateBountyData();
        handleClose();
      })
      .catch(error => {
        console.debug("Failed to fund bounty", error);
      });
  }

  function handleApprove() {
    setIsApproving(true);
    approve(amountToFund.toFixed())
      .catch(error => {
        if (error?.code === MetamaskErrors.UserRejected) return;
        
        console.debug("Failed to approve", error);
      })
      .finally(() => setIsApproving(false));
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
      isExecuting={isExecuting || isApproving}
      rewardPreview={rewardPreview}
      amountToFund={amountToFund}
    />
  );
}