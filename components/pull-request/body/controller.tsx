import React, { useState } from "react";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { useAppState } from "contexts/app-state";
import { addToast } from "contexts/reducers/change-toaster";

import { lowerCaseCompare } from "helpers/string";

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
  handleShowModal: () => void;
  updateComments: () => void;
}

export default function PullRequestBody({
  currentPullRequest,
  currentBounty,
  isCreatingReview,
  updateBountyData,
  handleShowModal,
  updateComments
}: PullRequestBodyControllerProps) {
  const router = useRouter();
  const { t } = useTranslation(["common", "pull-request"]);

  const [isCancelling, setIsCancelling] = useState(false);
  const [isMakingReady, setIsMakingReady] = useState(false);

  const { processEvent } = useApi();
  const { state, dispatch } = useAppState();
  const { getURLWithNetwork } = useNetwork();
  const { handleMakePullRequestReady, handleCancelPullRequest } = useBepro();

  const isWalletConnected = !!state.currentUser?.walletAddress;
  const isPullRequestReady = !!currentPullRequest?.isReady;
  const isPullRequestCanceled = !!currentPullRequest?.isCanceled;
  const isPullRequestCancelable = !!currentPullRequest?.isCancelable;
  const isPullRequestCreator = lowerCaseCompare(currentPullRequest?.userAddress, state.currentUser?.walletAddress);

  const isMakeReviewButton =
    isWalletConnected &&
    isPullRequestReady &&
    !isPullRequestCanceled;

  const isMakeReadyReviewButton =
    isWalletConnected &&
    !isPullRequestReady &&
    !isPullRequestCanceled &&
    isPullRequestCreator;

  const isCancelButton =
    isWalletConnected &&
    !isPullRequestCanceled &&
    isPullRequestCancelable &&
    isPullRequestCreator;

  function handleMakeReady() {
    if (!currentBounty || !currentPullRequest) return;

    setIsMakingReady(true);

    handleMakePullRequestReady(currentBounty.contractId, currentPullRequest.contractId)
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

    handleCancelPullRequest(currentBounty?.contractId, currentPullRequest?.contractId)
      .then((txInfo) => {
        const { blockNumber: fromBlock } = txInfo as { blockNumber: number };
        return processEvent(NetworkEvents.PullRequestCanceled, undefined, {
          fromBlock,
        });
      })
      .then(() => {
        updateBountyData();
        dispatch(addToast({
            type: "success",
            title: t("actions.success"),
            content: t("pull-request:actions.cancel.success"),
        }));

        router.push(getURLWithNetwork("/bounty/[id]", {
            id: currentBounty.id
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
      isCancelling={isCancelling}
      isMakingReady={isMakingReady}
      updateComments={updateComments}
      currentUser={state.currentUser}
      bountyId={currentBounty?.id}
    />
  );
}