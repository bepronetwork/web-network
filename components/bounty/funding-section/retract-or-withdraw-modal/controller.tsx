import { useState } from "react";

import { useTranslation } from "next-i18next";

import { useAppState } from "contexts/app-state";
import { toastError, toastSuccess } from "contexts/reducers/change-toaster";

import { NetworkEvents, StandAloneEvents } from "interfaces/enums/events";
import { IssueBigNumberData, fundingBenefactor } from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";

import RetractOrWithdrawModalView from "./view";

interface RetractOrWithdrawModalProps {
  show?: boolean;
  onCloseClick: () => void;
  funding: fundingBenefactor;
  currentBounty: IssueBigNumberData;
  updateBountyData: (updatePrData?: boolean) => void;
}

export default function RetractOrWithdrawModal({
  show = false,
  onCloseClick,
  funding,
  currentBounty,
  updateBountyData
}: RetractOrWithdrawModalProps) {
  const { t } = useTranslation(["common", "funding", "bounty"]);

  const [isExecuting, setIsExecuting] = useState(false);

  const { processEvent } = useApi();
  const { handleRetractFundBounty, handleWithdrawFundRewardBounty } =
    useBepro();

  const { dispatch } = useAppState();

  const isBountyClosed = !!currentBounty?.isClosed;
  const tokenSymbol = currentBounty?.transactionalToken?.symbol;
  const rewardTokenSymbol = currentBounty?.rewardToken?.symbol;
  const retractOrWithdrawAmount = isBountyClosed
    ? funding?.amount
        ?.dividedBy(currentBounty?.fundingAmount)
        .multipliedBy(currentBounty?.rewardAmount)
        ?.toFixed()
    : funding?.amount?.toFixed();

  function handleRetractOrWithdraw() {
    if (!currentBounty || !funding) return;

    setIsExecuting(true);
    if (isBountyClosed) {
      handleWithdrawFundRewardBounty(currentBounty?.contractId,
                                     funding.contractId,
                                     retractOrWithdrawAmount,
                                     rewardTokenSymbol)
        .then(() => {
          return processEvent(StandAloneEvents.BountyWithdrawReward,
                              undefined,
                              {
              issueId: currentBounty?.issueId,
                              });
        })
        .then(() => {
          updateBountyData();
          onCloseClick();
          dispatch(toastSuccess(t("funding:modals.reward.withdraw-x-symbol", {
                amount: retractOrWithdrawAmount,
                symbol: rewardTokenSymbol,
          }),
                                t("funding:modals.reward.withdraw-successfully")));
        })
        .catch((error) => {
          console.debug("Failed to withdraw funds reward", error);
          dispatch(toastError(t("funding:try-again"),
                              t("funding:modals.reward.failed-to-withdraw")));
        })
        .finally(() => setIsExecuting(false));
    } else {
      handleRetractFundBounty(currentBounty?.contractId,
                              funding.contractId)
        .then((txInfo) => {
          const { blockNumber: fromBlock } = txInfo as { blockNumber: number };

          updateBountyData();

          return processEvent(NetworkEvents.BountyFunded, undefined, {
            fromBlock,
          });
        })
        .then(async () => {
          onCloseClick();
          await updateBountyData();

          dispatch(toastSuccess(t("funding:modals.retract.retract-x-symbol", {
                amount: retractOrWithdrawAmount,
                symbol: tokenSymbol,
          }),
                                t("funding:modals.retract.retract-successfully")));
        })
        .catch((error) => {
          console.debug("Failed to retract funds", error);
          dispatch(toastError(t("funding:try-again"),
                              t("funding:modals.retract.failed-to-retract")));
        })
        .finally(() => setIsExecuting(false));
    }
  }

  return (
    <RetractOrWithdrawModalView
      show={show}
      onCloseClick={onCloseClick}
      isExecuting={isExecuting}
      isBountyClosed={isBountyClosed}
      retractOrWithdrawAmount={retractOrWithdrawAmount}
      rewardTokenSymbol={rewardTokenSymbol}
      tokenSymbol={tokenSymbol}
      handleRetractOrWithdraw={handleRetractOrWithdraw}
      contractId={currentBounty?.contractId}
    />
  );
}
