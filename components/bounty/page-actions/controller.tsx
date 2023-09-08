import { useState } from "react";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { PageActionsControllerProps } from "components/bounty/page-actions/page-actions";
import PageActionsView from "components/bounty/page-actions/view";

import { useAppState } from "contexts/app-state";
import { addToast } from "contexts/reducers/change-toaster";

import { getIssueState } from "helpers/handleTypeIssue";

import { NetworkEvents } from "interfaces/enums/events";

import { useStartWorking } from "x-hooks/api/bounty";
import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";

export default function PageActions({
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
    processEvent
  } = useApi();

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
  const isBountyOpen = currentBounty?.isClosed === false && currentBounty?.isCanceled === false;
  const isBountyInDraft = !!currentBounty?.isDraft;
  const isWorkingOnBounty = !!currentBounty?.working?.find(id => +id === +state.currentUser?.id);
  const isBountyOwner = isWalletConnected && currentBounty?.user?.address === state.currentUser?.walletAddress;
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
    !isBountyInDraft &&
    isBountyOpen &&
    !isWorkingOnBounty &&
    isStateToWorking;
  const isEditButton = isWalletConnected && isBountyInDraft && isBountyOwner;

  const rest = {
    isUpdateAmountButton,
    isStartWorkingButton,
    isEditButton,
    isBountyInDraft,
    isWalletConnected,
    isWorkingOnBounty,
    isBountyOpen,
    isCreatePr:
      isWalletConnected &&
      isBountyOpen &&
      !isBountyInDraft &&
      isWorkingOnBounty,
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
  }): Promise<void> {
    let pullRequestPayload = undefined;

    await createPrePullRequest({
      repoId: String(repoId),
      issueGithubID: currentBounty?.id,
      title: prTitle,
      description: prDescription,
      branch: "",
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
          pullRequestId,
        }) => {
        pullRequestPayload = {
            bountyId,
            pullRequestId,
            customNetworkName: state.Service?.network?.lastVisited,
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

    useStartWorking({
      id: currentBounty?.id,
      networkName: state.Service?.network?.active?.name
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
      showPRModal={showPRModal}
      handleShowPRModal={setShowPRModal}
      isExecuting={isExecuting}
      handlePullrequest={handlePullrequest}
      handleStartWorking={handleStartWorking}
      handleEditIssue={handleEditIssue}
      bounty={currentBounty}
      updateBountyData={updateBountyData}
      {...rest}
    />
  );
}