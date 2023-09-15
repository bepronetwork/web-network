import React, { useState } from "react";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { useAppState } from "contexts/app-state";
import { addToast } from "contexts/reducers/change-toaster";

import { lowerCaseCompare } from "helpers/string";

import { MetamaskErrors } from "interfaces/enums/Errors";
import { NetworkEvents } from "interfaces/enums/events";
import { Deliverable, IssueBigNumberData } from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import { useNetwork } from "x-hooks/use-network";

import DeliverableBodyView from "./view";

interface DeliverableBodyControllerProps {
  currentDeliverable: Deliverable;
  currentBounty: IssueBigNumberData;
  isCreatingReview: boolean;
  updateBountyData: () => void;
  handleShowModal: () => void;
  updateComments: () => void;
}

export default function DeliverableBody({
  currentDeliverable,
  currentBounty,
  isCreatingReview,
  updateBountyData,
  handleShowModal,
  updateComments
}: DeliverableBodyControllerProps) {
  const router = useRouter();
  const { t } = useTranslation(["common", "deliverable"]);

  const [isCancelling, setIsCancelling] = useState(false);
  const [isMakingReady, setIsMakingReady] = useState(false);

  const { processEvent } = useApi();
  const { state, dispatch } = useAppState();
  const { getURLWithNetwork } = useNetwork();
  const { handleMakePullRequestReady, handleCancelPullRequest } = useBepro();

  const isWalletConnected = !!state.currentUser?.walletAddress;
  const isDeliverableReady = currentDeliverable?.markedReadyForReview;
  const isDeliverableCanceled = currentDeliverable?.canceled;
  const isDeliverableCancelable = currentDeliverable?.isCancelable;
  const isDeliverableCreator = lowerCaseCompare(currentDeliverable?.user?.address, state.currentUser?.walletAddress);

  const isMakeReviewButton =
    isWalletConnected &&
    isDeliverableReady &&
    !isDeliverableCanceled;

  const isMakeReadyReviewButton =
    isWalletConnected &&
    !isDeliverableReady &&
    !isDeliverableCanceled &&
    isDeliverableCreator;

  const isCancelButton =
    isWalletConnected &&
    !isDeliverableCanceled &&
    isDeliverableCancelable &&
    isDeliverableCreator;

  function handleMakeReady() {
    if (!currentBounty || !currentDeliverable) return;

    setIsMakingReady(true);

    handleMakePullRequestReady(currentBounty.contractId, currentDeliverable.prContractId)
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
            content: t("deliverable:actions.make-ready.success"),
        }));
      })
      .catch((error) => {
        setIsMakingReady(false);

        if (error?.code === MetamaskErrors.UserRejected) return;

        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: t("deliverable:actions.make-ready.error"),
        }));
      });
  }

  function handleCancel() {
    setIsCancelling(true);

    handleCancelPullRequest(currentBounty?.contractId, currentDeliverable?.prContractId)
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
            content: t("deliverable:actions.cancel.success"),
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
              content: t("deliverable:actions.cancel.error"),
          }));
      })
      .finally(() => {
        setIsCancelling(false);
      });
  }

  return (
    <DeliverableBodyView
      currentDeliverable={currentDeliverable}
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