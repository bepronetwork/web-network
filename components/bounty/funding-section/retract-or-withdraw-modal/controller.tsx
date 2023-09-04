import { useTranslation } from "next-i18next";

import RetractOrWithdrawModalView from "components/bounty/funding-section/retract-or-withdraw-modal/view";

import { NetworkEvents, StandAloneEvents } from "interfaces/enums/events";
import { IssueBigNumberData, fundingBenefactor } from "interfaces/issue-data";

import useBepro from "x-hooks/use-bepro";
import useContractTransaction from "x-hooks/use-contract-transaction";

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

  const { handleRetractFundBounty, handleWithdrawFundRewardBounty } = useBepro();

  const isBountyClosed = !!currentBounty?.isClosed;
  const tokenSymbol = currentBounty?.transactionalToken?.symbol;
  const rewardTokenSymbol = currentBounty?.rewardToken?.symbol;
  const retractOrWithdrawAmount = isBountyClosed
    ? funding?.amount
        ?.dividedBy(currentBounty?.fundingAmount)
        .multipliedBy(currentBounty?.rewardAmount)
        ?.toFixed()
    : funding?.amount?.toFixed();

  const action = isBountyClosed ? {
    event: StandAloneEvents.BountyWithdrawReward,
    method: handleWithdrawFundRewardBounty,
    translation: "modals.reward.withdraw-x-symbol"
  } : {
    event: NetworkEvents.BountyFunded,
    method: handleRetractFundBounty,
    translation: "modals.retract.retract-x-symbol"
  };

  const [isExecuting, execute] = useContractTransaction(action.event,
                                                        action.method,
                                                        t(`funding:${action.translation}`, {
                                                          amount: retractOrWithdrawAmount,
                                                          symbol: tokenSymbol,
                                                        }),
                                                        t("funding:try-again"));

  function handleRetractOrWithdraw() {
    if (!currentBounty || !funding) return;

    execute(currentBounty?.contractId, funding.contractId, retractOrWithdrawAmount, rewardTokenSymbol)
      .then(() => {
        updateBountyData();
        onCloseClick();
      })
      .catch((error) => {
        console.debug("Failed to withdraw funds reward", error);
      });
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
