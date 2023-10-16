import { useEffect, useState } from "react";

import BigNumber from "bignumber.js";

import { useAppState } from "contexts/app-state";

import { getIssueState } from "helpers/handleTypeIssue";

import { IssueBigNumberData, fundingBenefactor } from "interfaces/issue-data";

import FundingSectionView from "./view";

interface FundingSectionProps {
  currentBounty: IssueBigNumberData;
  updateBountyData: () => void;
}

export default function FundingSection({ currentBounty, updateBountyData }: FundingSectionProps) {
  const [walletFunds, setWalletFunds] = useState<fundingBenefactor[]>();

  const { state } = useAppState();

  const isConnected = !!state.currentUser?.walletAddress;
  const hasReward = currentBounty?.hasReward;
  const isBountyClosed = !!currentBounty?.isClosed;
  const isBountyFunded = !!currentBounty?.isFunded;
  const isBountyInDraft = !!currentBounty?.isDraft;
  const transactionalSymbol = currentBounty?.transactionalToken?.symbol;
  const rewardTokenSymbol = currentBounty?.rewardToken?.symbol;
  const fundsGiven = walletFunds?.reduce((acc, fund) => fund.amount.plus(acc), BigNumber(0)) || BigNumber(0);
  const futureRewards = fundsGiven
    .multipliedBy(currentBounty?.rewardAmount)
    .dividedBy(currentBounty?.fundingAmount)
    .toFixed();
  const isCanceled =
    getIssueState({
      state: currentBounty?.state,
      amount: currentBounty?.amount,
      fundingAmount: currentBounty?.fundingAmount,
    }) === "canceled";

  useEffect(() => {
    if (!state.currentUser?.walletAddress || !currentBounty) return;

    const funds = 
      currentBounty?.benefactors?.filter((fund) => fund.address === state.currentUser.walletAddress);

    setWalletFunds(funds);
  }, [state.currentUser, currentBounty]);

  if (isBountyFunded && !walletFunds?.length) return <></>;

  return (
    <FundingSectionView
      walletFunds={walletFunds}
      updateBountyData={updateBountyData}
      isBountyFunded={isBountyFunded}
      isConnected={isConnected}
      isCanceled={isCanceled}
      transactionalSymbol={transactionalSymbol}
      bounty={currentBounty}
      hasReward={hasReward}
      fundsGiven={fundsGiven}
      futureRewards={futureRewards}
      isBountyClosed={isBountyClosed}
      isBountyInDraft={isBountyInDraft}
      rewardTokenSymbol={rewardTokenSymbol}
    />
  );
}
