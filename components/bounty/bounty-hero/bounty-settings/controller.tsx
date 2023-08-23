import { useEffect, useState } from "react";

import { useAppState } from "contexts/app-state";

import { IssueBigNumberData } from "interfaces/issue-data";

import { useAuthentication } from "x-hooks/use-authentication";
import useBepro from "x-hooks/use-bepro";

import BountySettingsView from "./view";

export default function BountySettings({
  handleEditIssue,
  isEditIssue,
  currentBounty,
  updateBountyData
}: {
  handleEditIssue?: () => void;
  isEditIssue?: boolean;
  currentBounty: IssueBigNumberData;
  updateBountyData: (updatePrData?: boolean) => void;
}) {
  const [isCancelable, setIsCancelable] = useState(false);
  const { state } = useAppState();
  const { handleReedemIssue, handleHardCancelBounty } = useBepro();
  const { updateWalletBalance } = useAuthentication();

  const objViewProps = {
    isWalletConnected: !!state.currentUser?.walletAddress,
    isBountyInDraft: !!currentBounty?.isDraft,
    hasOpenPullRequest: !!currentBounty?.pullRequests?.find((pullRequest) =>
        pullRequest?.userAddress?.toLowerCase() ===
          state.currentUser?.walletAddress?.toLowerCase() &&
        pullRequest?.status !== "canceled"),
    isBountyOwner:
      !!state.currentUser?.walletAddress &&
      currentBounty?.creatorAddress &&
      currentBounty?.creatorAddress ===
        state.currentUser?.walletAddress,

    isFundingRequest: !!currentBounty?.isFundingRequest,
    isBountyFunded: currentBounty?.fundedAmount?.isEqualTo(currentBounty?.fundingAmount),
    isBountyOpen:
      currentBounty?.isClosed === false &&
      currentBounty?.isCanceled === false,
  };

  async function handleHardCancel() {
    handleHardCancelBounty(currentBounty.contractId, currentBounty.issueId)
      .then(() => {
        updateWalletBalance();
        updateBountyData();
      });
  }

  async function handleRedeem() {
    if (!currentBounty) return;
    
    const isFundingRequest = currentBounty.fundingAmount.gt(0);

    handleReedemIssue(currentBounty.contractId, currentBounty.issueId, isFundingRequest)
      .then(() => {
        updateWalletBalance(true);
        updateBountyData();
      });
  }

  useEffect(() => {
    if (state.Service?.active && currentBounty)
      (async () => {
        const cancelableTime = await state.Service?.active.getCancelableTime();
        const canceable =
          +new Date() >=
          +new Date(+currentBounty.createdAt + cancelableTime);
        setIsCancelable(canceable);
      })();
  }, [state.Service?.active, currentBounty]);

  return (
    <BountySettingsView
      isCancelable={isCancelable}
      bounty={currentBounty}
      network={state.Service?.network}
      handleEditIssue={handleEditIssue}
      handleHardCancel={handleHardCancel}
      handleRedeem={handleRedeem}
      isEditIssue={isEditIssue}
      {...objViewProps}
    />
  );
}
