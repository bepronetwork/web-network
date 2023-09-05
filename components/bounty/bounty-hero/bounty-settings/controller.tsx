import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import { useAppState } from "contexts/app-state";
import { toastError } from "contexts/reducers/change-toaster";

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
  const { t } = useTranslation(["common", "bounty"]);

  const [isCancelable, setIsCancelable] = useState(false);

  const { state, dispatch } = useAppState();
  const { updateWalletBalance } = useAuthentication();
  const { handleReedemIssue, handleHardCancelBounty } = useBepro();

  const isGovernor = state.Service?.network?.active?.isGovernor;
  const objViewProps = {
    isWalletConnected: !!state.currentUser?.walletAddress,
    isBountyInDraft: !!currentBounty?.isDraft,
    hasOpenPullRequest: !!currentBounty?.pullRequests?.find((pullRequest) =>
        pullRequest?.userAddress?.toLowerCase() ===
          state.currentUser?.walletAddress?.toLowerCase() &&
        pullRequest?.status !== "canceled"),
    isBountyOwner:
      !!state.currentUser?.walletAddress &&
      currentBounty?.user?.address &&
      currentBounty?.user?.address ===
        state.currentUser?.walletAddress,

    isFundingRequest: !!currentBounty?.isFundingRequest,
    isBountyFunded: currentBounty?.fundedAmount?.isEqualTo(currentBounty?.fundingAmount),
    isBountyOpen:
      currentBounty?.isClosed === false &&
      currentBounty?.isCanceled === false,
  };

  async function handleHardCancel() {
    handleHardCancelBounty(currentBounty.contractId, currentBounty.id)
      .then(() => {
        updateWalletBalance();
        updateBountyData();
      })
      .catch(error => {
        dispatch(toastError(t("bounty:errors.failed-to-cancel"), t("actions.failed")));
        console.debug("Failed to cancel bounty", error);
      });
  }

  async function handleRedeem() {
    if (!currentBounty) return;
    
    const isFundingRequest = currentBounty.fundingAmount.gt(0);

    handleReedemIssue(currentBounty.contractId, currentBounty.id, isFundingRequest)
      .then(() => {
        updateWalletBalance(true);
        updateBountyData();
      })
      .catch(error => {
        dispatch(toastError(t("bounty:errors.failed-to-cancel"), t("actions.failed")));
        console.debug("Failed to cancel bounty", error);
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

  if (!objViewProps.isBountyInDraft && !isGovernor || !isCancelable && isGovernor)
    return <></>;

  return (
    <BountySettingsView
      isCancelable={isCancelable}
      network={state.Service?.network}
      handleEditIssue={handleEditIssue}
      handleHardCancel={handleHardCancel}
      handleRedeem={handleRedeem}
      isEditIssue={isEditIssue}
      {...objViewProps}
    />
  );
}
