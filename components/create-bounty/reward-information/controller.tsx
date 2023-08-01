import { useAppState } from "contexts/app-state";


import { RewardInformationControllerProps } from "types/components";

import RewardInformationView from "./view";

const ZeroNumberFormatValues = {
  value: "",
  formattedValue: "",
  floatValue: 0,
};

export default function RewardInformation({
  transactionalToken,
  rewardToken,
  isFundingType,
  rewardChecked,
  bountyDecimals,
  rewardDecimals,
  issueAmount,
  rewardAmount,
  bountyTokens,
  rewardTokens,
  rewardBalance,
  bountyBalance,
  updateRewardToken,
  updateTransactionalToken,
  addToken,
  handleRewardChecked,
  updateIssueAmount,
  updateRewardAmount,
  updateIsFundingType,
}: RewardInformationControllerProps) {
  const {
    state: { currentUser },
  } = useAppState();

  function handleIsFunding(e: boolean) {
    if (e === true) updateIssueAmount(ZeroNumberFormatValues);
    else {
      updateIssueAmount(ZeroNumberFormatValues);
      updateRewardAmount(ZeroNumberFormatValues);
    }

    updateIsFundingType(e);
  }

  return (
    <RewardInformationView
      isFundingType={isFundingType}
      defaultValue={ZeroNumberFormatValues}
      currentUserWallet={currentUser?.walletAddress}
      rewardChecked={rewardChecked}
      transactionalToken={transactionalToken}
      rewardToken={rewardToken}
      bountyDecimals={bountyDecimals}
      rewardDecimals={rewardDecimals}
      issueAmount={issueAmount}
      rewardAmount={rewardAmount}
      bountyTokens={bountyTokens}
      rewardTokens={rewardTokens}
      rewardBalance={rewardBalance}
      bountyBalance={bountyBalance}
      updateRewardToken={updateRewardToken}
      updateTransactionalToken={updateTransactionalToken}
      addToken={addToken}
      handleRewardChecked={handleRewardChecked}
      updateIssueAmount={updateIssueAmount}
      updateRewardAmount={updateRewardAmount}
      updateIsFunding={handleIsFunding}
    />
  );
}
