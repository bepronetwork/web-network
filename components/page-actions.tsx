import React, { useContext, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import Button from "components/button";
import NewProposal from "components/create-proposal";
import CreatePullRequestModal from "components/create-pull-request-modal";
import ForksAvatars from "components/forks-avatars";
import GithubLink from "components/github-link";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import Translation from "components/translation";
import UpdateBountyAmountModal from "components/update-bounty-amount-modal";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";
import { addToast } from "contexts/reducers/add-toast";
import { useRepos } from "contexts/repos";

import { getIssueState } from "helpers/handleTypeIssue";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";

import Modal from "./modal";

interface PageActionsProps {
  isRepoForked?: boolean;
  addNewComment?: (comment: string) => void;
}

export default function PageActions({
  isRepoForked = false,
  addNewComment
}: PageActionsProps) {
  const { t } = useTranslation(["common", "pull-request", "bounty"]);

  const {
    query: { repoId, id }
  } = useRouter();

  const [isExecuting, setIsExecuting] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [showGHModal, setShowGHModal] = useState(false);
  const [showHardCancelModal, setShowHardCancelModal] = useState(false);
  const [showUpdateAmount, setShowUpdateAmount] = useState(false);

  const [isCancelable, setIsCancelable] = useState(false);

  const {
    dispatch
  } = useContext(ApplicationContext);

  const { activeRepo } = useRepos();
  const { activeNetwork } = useNetwork();
  const { handleReedemIssue, handleHardCancelBounty, handleCreatePullRequest } = useBepro();
  const {service: DAOService} = useDAO()
  const { wallet, user, updateWalletBalance } = useAuthentication();
  const { networkIssue, activeIssue, getNetworkIssue, updateIssue } = useIssue();
  const { createPrePullRequest, cancelPrePullRequest, startWorking, processEvent } = useApi();

  const issueGithubID = activeIssue?.githubId;

  const isCouncilMember = !!wallet?.isCouncil;
  const isBountyInDraft = !!networkIssue?.isDraft;
  const isBountyFinished = !!networkIssue?.isFinished;
  const isWalletConnected = !!wallet?.address;
  const isWalletAndGHConnected = isWalletConnected && !!user?.login;
  const isFundingRequest = networkIssue?.fundingAmount?.gt(0) || activeIssue?.fundingAmount?.gt(0);
  const isWorkingOnBounty = !!activeIssue?.working?.find((login) => login === user?.login);
  const isBountyOpen = networkIssue?.closed === false && networkIssue?.canceled === false;
  const issueState = getIssueState({
    state: activeIssue?.state,
    amount: activeIssue?.amount,
    fundingAmount: activeIssue?.fundingAmount 
  })
  const isBountyFunded = activeIssue?.fundedAmount?.isEqualTo(activeIssue?.fundingAmount)
  const isStateToWorking = ["proposal", "open", "ready"].some(value => value === issueState);

  const isBountyOwner =
    wallet?.address && networkIssue?.creator && networkIssue?.creator?.toLowerCase() === wallet?.address?.toLowerCase();

  const hasPullRequests =
    !!activeIssue?.pullRequests?.filter(pullRequest => pullRequest?.status !== "canceled")?.length;

  const hasOpenPullRequest =
    !!activeIssue?.pullRequests?.find(pullRequest => pullRequest?.githubLogin === user?.login &&
      pullRequest?.status !== "canceled");


  async function updateBountyData() { 
    return Promise.all([
      updateIssue(`${repoId}`, `${id}`),
      getNetworkIssue()
    ]);
  }

  async function handleRedeem() {
    handleReedemIssue(issueState === "funding")
      .then(() => {
        updateWalletBalance();
        updateBountyData();
      });
  }
 
  async function handleHardCancel() {
    setShowHardCancelModal(false)
    handleHardCancelBounty()
      .then(() => {
        updateWalletBalance();
        updateBountyData();
      });
  }

  useEffect(()=>{
    if(DAOService && networkIssue)
      (async()=>{
        const cancelableTime = await DAOService.getCancelableTime();
        const canceable = +new Date() >= +new Date(networkIssue.creationDate + cancelableTime) 
        setIsCancelable(canceable)
      })()
  },[DAOService, networkIssue])

  async function handlePullrequest({
    title: prTitle,
    description: prDescription,
    branch
  }): Promise<void> {
    if(!activeRepo?.hasGhVisibility) return setShowGHModal(true)
    let pullRequestPayload = undefined;

    await createPrePullRequest({
      repoId: String(repoId),
      issueGithubID,
      title: prTitle,
      description: prDescription,
      username: user?.login,
      branch,
      wallet: wallet.address
    }).then(({ bountyId, originRepo, originBranch, originCID, userRepo, userBranch, cid }) => {
      pullRequestPayload = {
        repoId,
        issueGithubId: issueGithubID,
        bountyId,
        issueCid: originCID,
        pullRequestGithubId: cid,
        customNetworkName: activeNetwork.name,
        creator: userRepo.split("/")[0],
        userBranch,
        userRepo,
        wallet: wallet.address
      };

      return handleCreatePullRequest(bountyId, originRepo, originBranch, originCID, userRepo, userBranch, cid);
    })
      .then(txInfo => {
        return processEvent("pull-request", "created", activeNetwork?.name, {
          fromBlock: (txInfo as { blockNumber: number }).blockNumber
        });
      })
      .then(() => {
        setShowPRModal(false)
        dispatch(addToast({
          type: "success",
          title: t("actions.success"),
          content: t("pull-request:actions.create.success")
        }));

        return updateBountyData();
      })
      .catch((err) => {
        if (pullRequestPayload) cancelPrePullRequest(pullRequestPayload);

        if (err.response?.status === 422 && err.response?.data) {
          err.response?.data?.map((item) =>
            dispatch(addToast({
              type: "danger",
              title: t("actions.failed"),
              content: item.message
            })));
        } else {
          dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: t("pull-request:actions.create.error")
          }));
        }
      });
  }

  async function handleStartWorking() {
    if(!activeRepo?.hasGhVisibility) return setShowGHModal(true)
    setIsExecuting(true);

    startWorking({
      issueId: networkIssue?.cid, 
      githubLogin: user?.login, 
      networkName: activeNetwork?.name, 
      wallet: wallet.address
    })
      .then((response) => {
        dispatch(addToast({
          type: "success",
          title: t("actions.success"),
          content: t("bounty:actions.start-working.success")
        }));

        addNewComment(response.data);

        return updateBountyData();
      })
      .then(() => setIsExecuting(false))
      .catch((error) => {
        console.log("Failed to start working", error);
        dispatch(addToast({
          type: "danger",
          title: t("actions.failed"),
          content: t("bounty:actions.start-working.error")
        }));

        setIsExecuting(false);
      });
  }

  function renderForkRepositoryLink() {
    if (isWalletAndGHConnected && !isBountyInDraft && !isBountyFinished && isBountyOpen && !isRepoForked)
      return (
        <GithubLink
          repoId={String(repoId)}
          forcePath={activeIssue?.repository?.githubPath}
          hrefPath="fork"
          color="primary"
        >
          <Translation label="actions.fork-repository" />
        </GithubLink>);
  }

  function renderStartWorkingButton() {
    if (isWalletAndGHConnected && 
        !isBountyInDraft && 
        isBountyOpen && 
        !isWorkingOnBounty && 
        isRepoForked &&
        isStateToWorking)
      return(
        <ReadOnlyButtonWrapper>
          <Button
            color="primary"
            onClick={handleStartWorking}
            className="read-only-button"
            disabled={isExecuting}
            isLoading={isExecuting}
          >
            <span>
              <Translation ns="bounty" label="actions.start-working.title" />
            </span>
          </Button>
        </ReadOnlyButtonWrapper>
      );
  }

  function renderCreatePullRequestButton() {
    if (isWalletAndGHConnected && 
        isBountyOpen && 
        !isBountyInDraft && 
        isWorkingOnBounty && 
        isRepoForked)
      return(
        <ReadOnlyButtonWrapper>
          <Button
            className="read-only-button"
            onClick={() => setShowPRModal(true)}
            disabled={!user?.login || !wallet?.address}
          >
            <Translation ns="pull-request" label="actions.create.title" />
          </Button>
        </ReadOnlyButtonWrapper>
      );
  }

  function renderHardCancelButton() {
    if (wallet?.isNetworkGovernor && isCancelable)
      return (
        <ReadOnlyButtonWrapper>
          <Button
            color="danger"
            className="read-only-button me-1"
            onClick={()=>setShowHardCancelModal(true)}
          >
            <Translation ns="common" label="actions.cancel" />
          </Button>
        </ReadOnlyButtonWrapper>
      );
  }

  function renderCancelButton() {
    const isDraftOrNotFunded = activeIssue?.fundingAmount.isGreaterThan(BigNumber(0))
    ? !isBountyFunded
    : isBountyInDraft;
    
    if (isWalletConnected && isBountyOpen && isBountyOwner && isDraftOrNotFunded)
      return(
        <ReadOnlyButtonWrapper>
          <Button
            className="read-only-button me-1"
            onClick={handleRedeem}
          >
            <Translation ns="common" label="actions.cancel" />
          </Button>
        </ReadOnlyButtonWrapper>
      );
  }

  function renderUpdateAmountButton() {
    if (isWalletConnected && isBountyOpen && isBountyOwner && isBountyInDraft && !isFundingRequest)
      return(
        <ReadOnlyButtonWrapper>
          <Button
            className="read-only-button me-1"
            onClick={() => setShowUpdateAmount(true)}
          >
            <Translation ns="bounty" label="actions.update-amount" />
          </Button>
        </ReadOnlyButtonWrapper>
      );
  }

  function renderCreateProposalButton() {
    if (isWalletConnected && isCouncilMember && isBountyOpen && isBountyFinished && hasPullRequests)
      return(
        <NewProposal amountTotal={networkIssue?.tokenAmount} pullRequests={activeIssue?.pullRequests} />
      );
  }

  function renderViewPullRequestLink() {
    if (isWalletAndGHConnected && !isBountyInDraft && hasOpenPullRequest)
      return(
        <GithubLink
          repoId={String(repoId)}
          forcePath={activeIssue?.repository?.githubPath}
          hrefPath={`pull?q=base:${activeIssue?.branch}`}
          color="primary"
        >
          <Translation ns="pull-request" label="actions.view" />
        </GithubLink>
      );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="h4 d-flex align-items-center">
              {t("misc.details")}
            </h4>

            <div className="d-flex flex-row align-items-center gap-20">
              {!isMobile && 
              <ForksAvatars forks={activeRepo?.forks || []} repositoryPath={activeIssue?.repository?.githubPath} />}

              {renderHardCancelButton()}

              {renderForkRepositoryLink()}

              {renderStartWorkingButton()}

              {renderCreatePullRequestButton()}

              {renderCancelButton()}

              {renderUpdateAmountButton()}

              {renderCreateProposalButton()}

              {renderViewPullRequestLink()}

              <GithubLink
                repoId={String(repoId)}
                onClick={!activeRepo?.hasGhVisibility ? () => setShowGHModal(true) : null}
                forcePath={activeIssue?.repository?.githubPath}
                hrefPath={`${(activeIssue?.state?.toLowerCase() === "pull request" && "pull") ||
                  "issues"
                  }/${issueGithubID || ""}`}
              >
                {t("actions.view-on-github")}
              </GithubLink>
            </div>
          </div>
        </div>
      </div>

      <CreatePullRequestModal
        show={showPRModal}
        title={activeIssue?.title}
        description={activeIssue?.body}
        onConfirm={handlePullrequest}
        repo={
          (user?.login &&
            activeIssue?.repository?.githubPath) &&
          activeIssue?.repository?.githubPath ||
          ""
        }
        onCloseClick={() => setShowPRModal(false)}
      />

      <UpdateBountyAmountModal
        show={showUpdateAmount}
        repoId={repoId}
        transactionalAddress={networkIssue?.transactional}
        bountyId={networkIssue?.id}
        ghId={activeIssue?.githubId}
        handleClose={() => setShowUpdateAmount(false)}
      />

      <Modal
        title={t("modals.gh-access.title")}
        centerTitle
        show={showGHModal}
        okLabel={t("actions.close")}
        onOkClick={() => setShowGHModal(false)}
      >
        <h5 className="text-center"><Translation ns="common" label="modals.gh-access.content" /></h5>
      </Modal>
      
      <Modal
        title={t("modals.hard-cancel.title")}
        centerTitle
        show={showHardCancelModal}
        onCloseClick={() => setShowHardCancelModal(false)}
        cancelLabel={t("actions.close")}
        okLabel={t("actions.continue")}
        onOkClick={handleHardCancel}
      >
        <h5 className="text-center"><Translation ns="common" label="modals.hard-cancel.content" /></h5>
      </Modal>
    </div>
  );
}