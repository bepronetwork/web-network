import React, { useState } from "react";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { useAppState } from "contexts/app-state";
import { addToast } from "contexts/reducers/change-toaster";

import { MetamaskErrors } from "interfaces/enums/Errors";
import { NetworkEvents } from "interfaces/enums/events";
import { IssueBigNumberData, PullRequest } from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import { useNetwork } from "x-hooks/use-network";

import PullRequestBodyView from "./view";

interface PullRequestBodyControllerProps {
  currentPullRequest: PullRequest;
  currentBounty: IssueBigNumberData;
  isCreatingReview: boolean;
  updateBountyData: () => void;
  updatePrDetails: () => void;
  handleShowModal: () => void;
  updateComments: () => void;
}

export default function PullRequestBody({
  currentPullRequest,
  currentBounty,
  isCreatingReview,
  updateBountyData,
  updatePrDetails,
  handleShowModal,
  updateComments
}: PullRequestBodyControllerProps) {
  const { t } = useTranslation(["common", "pull-request"]);

  const [isCancelling, setIsCancelling] = useState(false);
  const [isMakingReady, setIsMakingReady] = useState(false);

  const { state, dispatch } = useAppState();

  const router = useRouter();
  const { getURLWithNetwork } = useNetwork();
  const { processEvent } = useApi();

  const { handleMakePullRequestReady, handleCancelPullRequest } = useBepro();

  const isWalletConnected = !!state.currentUser?.walletAddress;
  const isPullRequestOpen = currentPullRequest?.state?.toLowerCase() === "open";
  const isPullRequestReady = !!currentPullRequest?.isReady;
  const isPullRequestCanceled = !!currentPullRequest?.isCanceled;
  const isPullRequestCancelable = !!currentPullRequest?.isCancelable;
  const isPullRequestCreator =
    currentPullRequest?.userAddress === state.currentUser?.walletAddress;
  const branchProtectionRules =
    state.Service?.network?.repos?.active?.branchProtectionRules;
  const approvalsRequired = branchProtectionRules
    ? branchProtectionRules[currentBounty?.branch]
        ?.requiredApprovingReviewCount || 0
    : 0;
  const canUserApprove =
    state.Service?.network?.repos?.active?.viewerPermission !== "READ";
  const approvalsCurrentPr = currentPullRequest?.approvals?.total || 0;
  const prsNeedsApproval = approvalsCurrentPr < approvalsRequired;

  const isMakeReviewButton =
    isWalletConnected &&
    isPullRequestOpen &&
    isPullRequestReady &&
    !isPullRequestCanceled;

  const isMakeReadyReviewButton =
    isWalletConnected &&
    isPullRequestOpen &&
    !isPullRequestReady &&
    !isPullRequestCanceled &&
    isPullRequestCreator;

  const isCancelButton =
    isWalletConnected &&
    !isPullRequestCanceled &&
    isPullRequestCancelable &&
    isPullRequestCreator;

  const isApproveLink =
    isWalletConnected &&
    prsNeedsApproval &&
    canUserApprove &&
    isPullRequestReady &&
    !isPullRequestCanceled;

  function handleMakeReady() {
    if (!currentBounty || !currentPullRequest) return;

    setIsMakingReady(true);

    handleMakePullRequestReady(currentBounty.contractId,
                               currentPullRequest.contractId)
      .then((txInfo) => {
        const { blockNumber: fromBlock } = txInfo as { blockNumber: number };
        return processEvent(NetworkEvents.PullRequestReady, undefined, {
          fromBlock,
        });
      })
      .then(() => {
        return updateBountyData();
      })
      .then(() => {
        setIsMakingReady(false);
        dispatch(addToast({
            type: "success",
            title: t("actions.success"),
            content: t("pull-request:actions.make-ready.success"),
        }));
      })
      .catch((error) => {
        setIsMakingReady(false);

        if (error?.code === MetamaskErrors.UserRejected) return;

        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: t("pull-request:actions.make-ready.error"),
        }));
      });
  }

  function handleCancel() {
    setIsCancelling(true);

    handleCancelPullRequest(currentBounty?.contractId,
                            currentPullRequest?.contractId)
      .then((txInfo) => {
        const { blockNumber: fromBlock } = txInfo as { blockNumber: number };
        return processEvent(NetworkEvents.PullRequestCanceled, undefined, {
          fromBlock,
        });
      })
      .then(() => {
        updateBountyData();
        updatePrDetails();
        dispatch(addToast({
            type: "success",
            title: t("actions.success"),
            content: t("pull-request:actions.cancel.success"),
        }));

        router.push(getURLWithNetwork("/bounty", {
            id: currentBounty.githubId,
            repoId: currentBounty.repository_id,
        }));
      })
      .catch((error) => {
        if (error?.code !== MetamaskErrors.UserRejected)
          dispatch(addToast({
              type: "danger",
              title: t("actions.failed"),
              content: t("pull-request:actions.cancel.error"),
          }));
      })
      .finally(() => {
        setIsCancelling(false);
      });
  }

  return (
    <PullRequestBodyView
      currentPullRequest={currentPullRequest}
      isCreatingReview={isCreatingReview}
      handleShowModal={handleShowModal}
      handleCancel={handleCancel}
      handleMakeReady={handleMakeReady}
      isMakeReviewButton={isMakeReviewButton}
      isMakeReadyReviewButton={isMakeReadyReviewButton}
      isCancelButton={isCancelButton}
      isApproveLink={isApproveLink}
      isCancelling={isCancelling}
      isMakingReady={isMakingReady}
      githubPath={state.Service?.network?.repos?.active?.githubPath}
      updateComments={updateComments}
      currentUser={state.currentUser}
      bountyId={currentBounty?.id}
    />
  );
}