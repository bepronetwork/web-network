import React, { useState } from "react";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { useAppState } from "contexts/app-state";
import { addToast } from "contexts/reducers/change-toaster";

import { getIssueState } from "helpers/handleTypeIssue";

import { NetworkEvents } from "interfaces/enums/events";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";

import { PageActionsControllerProps } from "./page-actions";
import PageActionsView from "./view";

export default function PageActions({
  isRepoForked = false,
  handleEditIssue,
  isEditIssue,
  currentBounty,
  updateBountyData
}: PageActionsControllerProps) {
  const { t } = useTranslation([
    "common",
    "pull-request",
    "bounty",
    "proposal",
  ]);

  const {
    query: { repoId },
  } = useRouter();

  const [isExecuting, setIsExecuting] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);

  const { state, dispatch } = useAppState();
  const { handleCreatePullRequest } = useBepro();
  const {
    createPrePullRequest,
    cancelPrePullRequest,
    startWorking,
    processEvent,
  } = useApi();

  const issueGithubID = currentBounty?.githubId;
  const isCouncilMember = !!state.Service?.network?.active?.isCouncil;
  const isBountyReadyToPropose = !!currentBounty?.isReady;
  const bountyState = getIssueState({
    state: currentBounty?.state,
    amount: currentBounty?.amount,
    fundingAmount: currentBounty?.fundingAmount,
  });
  const hasPullRequests = 
    !!currentBounty?.pullRequests?.filter((pullRequest) => pullRequest?.status !== "canceled")?.length;
  const isWalletConnected = !!state.currentUser?.walletAddress;
  const isGithubConnected = !!state.currentUser?.login;
  const isBountyOpen =
    currentBounty?.isClosed === false &&
    currentBounty?.isCanceled === false;
  const isBountyInDraft = !!currentBounty?.isDraft;
  const isWorkingOnBounty = !!currentBounty?.working?.find((login) => login === state.currentUser?.login);
  const isBountyOwner =
  isWalletConnected &&
  currentBounty?.creatorAddress &&
  currentBounty?.creatorAddress ===
    state.currentUser?.walletAddress
  const isFundingRequest = !!currentBounty?.isFundingRequest
  const isStateToWorking = ["proposal", "open", "ready"].some((value) => value === bountyState)
  const isUpdateAmountButton =
    isWalletConnected &&
    isBountyOpen &&
    isBountyOwner &&
    isBountyInDraft &&
    !isFundingRequest &&
    !isEditIssue;
  const isStartWorkingButton =
    isWalletConnected &&
    isGithubConnected &&
    !isBountyInDraft &&
    isBountyOpen &&
    !isWorkingOnBounty &&
    isRepoForked &&
    isStateToWorking &&
    !!state.currentUser?.accessToken
  const isForkRepositoryLink =
    isGithubConnected && !isBountyInDraft && isBountyOpen && !isRepoForked;
  const isEditButton = isWalletConnected && isBountyInDraft && isBountyOwner;

  const rest = {
    isUpdateAmountButton,
    isStartWorkingButton,
    isForkRepositoryLink,
    isEditButton,
    isBountyInDraft,
    isWalletConnected,
    isGithubConnected,
    isWorkingOnBounty,
    isBountyOpen,
    isCreatePr:
      isWalletConnected &&
      isGithubConnected &&
      isBountyOpen &&
      !isBountyInDraft &&
      isWorkingOnBounty &&
      isRepoForked,
    isCreateProposal:
      isWalletConnected &&
      isCouncilMember &&
      isBountyOpen &&
      isBountyReadyToPropose &&
      hasPullRequests,
  };

  async function handlePullrequest({
    title: prTitle,
    description: prDescription,
    branch,
  }): Promise<void> {
    let pullRequestPayload = undefined;

    await createPrePullRequest({
      repoId: String(repoId),
      issueGithubID,
      title: prTitle,
      description: prDescription,
      username: state.currentUser?.login,
      branch,
      wallet: state.currentUser.walletAddress,
    })
      .then(({
          bountyId,
          originRepo,
          originBranch,
          originCID,
          userRepo,
          userBranch,
          cid,
        }) => {
        pullRequestPayload = {
            repoId,
            issueGithubId: issueGithubID,
            bountyId,
            issueCid: originCID,
            pullRequestGithubId: cid,
            customNetworkName: state.Service?.network?.lastVisited,
            creator: userRepo.split("/")[0],
            userBranch,
            userRepo,
            wallet: state.currentUser.walletAddress,
        };

        return handleCreatePullRequest(bountyId,
                                       originRepo,
                                       originBranch,
                                       originCID,
                                       userRepo,
                                       userBranch,
                                       cid);
      })
      .then((txInfo) => {
        return processEvent(NetworkEvents.PullRequestCreated, undefined, {
          fromBlock: (txInfo as { blockNumber: number }).blockNumber,
        });
      })
      .then(() => {
        setShowPRModal(false);
        dispatch(addToast({
            type: "success",
            title: t("actions.success"),
            content: t("pull-request:actions.create.success"),
        }));

        return updateBountyData(true);
      })
      .catch((err) => {
        if (pullRequestPayload) cancelPrePullRequest(pullRequestPayload);

        if (err.response?.status === 422 && err.response?.data) {
          err.response?.data?.map((item) =>
            dispatch(addToast({
                type: "danger",
                title: t("actions.failed"),
                content: item.message,
            })));
        } else {
          dispatch(addToast({
              type: "danger",
              title: t("actions.failed"),
              content: t("pull-request:actions.create.error"),
          }));
        }
      });
  }

  async function handleStartWorking() {
    setIsExecuting(true);

    startWorking({
      issueId: currentBounty?.issueId,
      githubLogin: state.currentUser?.login,
      networkName: state.Service?.network?.active?.name,
      wallet: state.currentUser.walletAddress,
    })
      .then(() => {
        dispatch(addToast({
            type: "success",
            title: t("actions.success"),
            content: t("bounty:actions.start-working.success"),
        }));

        return updateBountyData();
      })
      .then(() => setIsExecuting(false))
      .catch((error) => {
        console.log("Failed to start working", error);
        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: t("bounty:actions.start-working.error"),
        }));

        setIsExecuting(false);
      });
  }

  return (
    <PageActionsView
      ghVisibility={state.Service?.network?.repos?.active?.ghVisibility}
      showPRModal={showPRModal}
      handleShowPRModal={setShowPRModal}
      isExecuting={isExecuting}
      handlePullrequest={handlePullrequest}
      handleStartWorking={handleStartWorking}
      handleEditIssue={handleEditIssue}
      currentUser={state.currentUser}
      bounty={currentBounty}
      updateBountyData={updateBountyData}
      {...rest}
    />
  );
}