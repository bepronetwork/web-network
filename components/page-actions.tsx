import React, {useEffect, useState} from "react";
import {isMobile} from "react-device-detect";

import {useTranslation} from "next-i18next";
import {useRouter} from "next/router";

import EditIcon from "assets/icons/transactions/edit";

import ConnectGithub from "components/connect-github";
import { ContextualSpan } from "components/contextual-span";
import ContractButton from "components/contract-button";
import NewProposal from "components/create-proposal";
import CreatePullRequestModal from "components/create-pull-request-modal";
import ForksAvatars from "components/forks-avatars";
import GithubLink from "components/github-link";
import Modal from "components/modal";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import Translation from "components/translation";
import UpdateBountyAmountModal from "components/update-bounty-amount-modal";

import {useAppState} from "contexts/app-state";
import {BountyEffectsProvider} from "contexts/bounty-effects";
import {addToast} from "contexts/reducers/change-toaster";

import {getIssueState} from "helpers/handleTypeIssue";

import useApi from "x-hooks/use-api";
import {useAuthentication} from "x-hooks/use-authentication";
import useBepro from "x-hooks/use-bepro";
import {useBounty} from "x-hooks/use-bounty";

interface PageActionsProps {
  isRepoForked?: boolean;
  addNewComment?: (comment: string) => void;
  handleEditIssue?: () => void;
  isEditIssue?: boolean;
}

export default function PageActions({
                                      isRepoForked = false,
                                      addNewComment,
                                      handleEditIssue,
                                      isEditIssue
                                    }: PageActionsProps) {
  const {t} = useTranslation(["common", "pull-request", "bounty"]);

  const { query: { repoId } } = useRouter();

  const [isExecuting, setIsExecuting] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [showGHModal, setShowGHModal] = useState(false);
  const [showHardCancelModal, setShowHardCancelModal] = useState(false);
  const [showUpdateAmount, setShowUpdateAmount] = useState(false);

  const [isCancelable, setIsCancelable] = useState(false);

  const { state, dispatch } = useAppState();
  const { getDatabaseBounty } = useBounty();
  const { updateWalletBalance } = useAuthentication();
  const { handleReedemIssue, handleHardCancelBounty, handleCreatePullRequest } = useBepro();
  const { createPrePullRequest, cancelPrePullRequest, startWorking, processEvent } = useApi();

  const issueGithubID = state.currentBounty?.data?.githubId;
  const isCouncilMember = !!state.Service?.network?.active?.isCouncil;
  const isBountyInDraft = !!state.currentBounty?.data?.isDraft;
  const isBountyReadyToPropose = !!state.currentBounty?.data?.isReady;
  const isWalletConnected = !!state.currentUser?.walletAddress;
  const isKycVerified = state?.currentUser?.kycSession?.status === 'VERIFIED';
  const isGithubConnected = !!state.currentUser?.login;
  const isFundingRequest = !!state.currentBounty?.data?.isFundingRequest;
  const isWorkingOnBounty = !!state.currentBounty?.data?.working?.find((login) => login === state.currentUser?.login);
  const isBountyOpen = state.currentBounty?.data?.isClosed === false && state.currentBounty?.data?.isCanceled === false;
  const issueState = getIssueState({
    state: state.currentBounty?.data?.state,
    amount: state.currentBounty?.data?.amount,
    fundingAmount: state.currentBounty?.data?.fundingAmount
  })
  const isBountyFunded = state.currentBounty?.data?.fundedAmount?.isEqualTo(state.currentBounty?.data?.fundingAmount)
  const isStateToWorking = ["proposal", "open", "ready"].some(value => value === issueState);

  const isBountyOwner =
    isWalletConnected &&
    state.currentBounty?.data?.creatorAddress &&
    state.currentBounty?.data?.creatorAddress === state.currentUser?.walletAddress;

  const hasPullRequests =
    !!state.currentBounty?.data?.pullRequests?.filter(pullRequest => pullRequest?.status !== "canceled")?.length;

  const hasOpenPullRequest = 
    !!state.currentBounty?.data?.pullRequests?.find(pullRequest => 
      pullRequest?.githubLogin === state.currentUser?.login && pullRequest?.status !== "canceled");

  async function handleRedeem() {
    handleReedemIssue(getIssueState({
      state: state.currentBounty?.data?.state,
      amount: state.currentBounty?.data?.amount,
      fundingAmount: state.currentBounty?.data?.fundingAmount
    }) === "funding")
      .then(() => {
        updateWalletBalance(true);
        getDatabaseBounty(true);
      });
  }

  async function handleHardCancel() {
    setShowHardCancelModal(false);
    handleHardCancelBounty()
      .then(() => {
        updateWalletBalance();
        getDatabaseBounty(true);
      });
  }

  useEffect(() => {
    if (state.Service?.active && state.currentBounty?.data)
      (async () => {
        const cancelableTime = await state.Service?.active.getCancelableTime();
        const canceable = +new Date() >= +new Date(+state.currentBounty?.data.createdAt + cancelableTime)
        setIsCancelable(canceable)
      })()
  }, [state.Service?.active, state.currentBounty?.data])

  async function handlePullrequest({
    title: prTitle,
    description: prDescription,
    branch
  }): Promise<void> {
    if (!state.Service?.network?.repos?.active?.ghVisibility) return setShowGHModal(true)
    let pullRequestPayload = undefined;

    await createPrePullRequest({
      repoId: String(repoId),
      issueGithubID,
      title: prTitle,
      description: prDescription,
      username: state.currentUser?.login,
      branch,
      wallet: state.currentUser.walletAddress
    }).then(({bountyId, originRepo, originBranch, originCID, userRepo, userBranch, cid}) => {
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
        wallet: state.currentUser.walletAddress
      };

      return handleCreatePullRequest(bountyId, originRepo, originBranch, originCID, userRepo, userBranch, cid);
    })
      .then(txInfo => {
        return processEvent("pull-request", "created", state.Service?.network?.lastVisited, {
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

        return getDatabaseBounty(true);
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
    if (!state.Service?.network?.repos?.active?.ghVisibility) return setShowGHModal(true)
    setIsExecuting(true);

    startWorking({
      issueId: state.currentBounty?.data?.issueId,
      githubLogin: state.currentUser?.login,
      networkName: state.Service?.network?.active?.name,
      wallet: state.currentUser.walletAddress
    })
      .then((response) => {
        dispatch(addToast({
          type: "success",
          title: t("actions.success"),
          content: t("bounty:actions.start-working.success")
        }));

        addNewComment(response.data);
        return getDatabaseBounty(true);
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
    if (isGithubConnected && !isBountyInDraft && isBountyOpen && !isRepoForked)
      return (
        <GithubLink
          forcePath={state.currentBounty?.data?.repository?.githubPath}
          hrefPath="fork"
          color="primary">
          <Translation label="actions.fork-repository"/>
        </GithubLink>);
  }

  function renderStartWorkingButton() {
    if (isWalletConnected && 
        isGithubConnected &&
        !isBountyInDraft &&
        isBountyOpen &&
        !isWorkingOnBounty &&
        isRepoForked &&
        isStateToWorking &&
        state?.currentUser?.accessToken
        ){

      if (state.Settings.kyc.isKycEnabled && state.currentBounty?.data?.isKyc && !isKycVerified){
        return <Link href={useNetworkTheme().getURLWithNetwork("/profile")}>
          <ContractButton>
            <Translation ns="bounty" label="kyc.identify-to-start" />
          </ContractButton>
        </Link>
      }
      else{
        return (
            <ReadOnlyButtonWrapper>
              <Button
                color="primary"
                onClick={handleStartWorking}
                className="read-only-button"
                disabled={isExecuting}
                isLoading={isExecuting}
              >
                <span>
                  <Translation ns="bounty" label="actions.start-working.title"/>
                </span>
              </Button>
            </ReadOnlyButtonWrapper>
        );
      }
    }
  }

  function renderCreatePullRequestButton() {
    if (isWalletConnected && 
        isGithubConnected &&
        isBountyOpen &&
        !isBountyInDraft &&
        isWorkingOnBounty &&
        isRepoForked)
      return (
        <ReadOnlyButtonWrapper>
          <ContractButton
            className="read-only-button"
            onClick={() => setShowPRModal(true)}
            disabled={!state.currentUser?.login || !isWalletConnected}
          >
            <Translation ns="pull-request" label="actions.create.title"/>
          </ContractButton>
        </ReadOnlyButtonWrapper>
      );
  }

  function renderHardCancelButton() {
    if (state.Service?.network?.active?.isGovernor && isCancelable)
      return (
        <ReadOnlyButtonWrapper>
          <ContractButton
            color="danger"
            className="read-only-button me-1"
            onClick={() => setShowHardCancelModal(true)}
          >
            <Translation ns="common" label="actions.cancel"/>
          </ContractButton>
        </ReadOnlyButtonWrapper>
      );
  }

  function renderCancelButton() {
    const isDraftOrNotFunded = isFundingRequest ? !isBountyFunded : isBountyInDraft;

    if (isWalletConnected && isBountyOpen && isBountyOwner && isDraftOrNotFunded && !isEditIssue)
      return (
        <ReadOnlyButtonWrapper>
          <ContractButton
            className="read-only-button me-1"
            onClick={handleRedeem}
          > 
            <Translation ns="common" label="actions.cancel"/>
          </ContractButton>
        </ReadOnlyButtonWrapper>
      );
  }

  function renderUpdateAmountButton() {
    if (isWalletConnected && isBountyOpen && isBountyOwner && isBountyInDraft && !isFundingRequest && !isEditIssue)
      return (
        <ReadOnlyButtonWrapper>
          <ContractButton
            className="read-only-button me-1"
            onClick={() => setShowUpdateAmount(true)}
          >
            <Translation ns="bounty" label="actions.update-amount"/>
          </ContractButton>
        </ReadOnlyButtonWrapper>
      );
  }

  function renderCreateProposalButton() {
    if (isWalletConnected && isCouncilMember && isBountyOpen && isBountyReadyToPropose && hasPullRequests)
      return (
        <NewProposal 
          amountTotal={state.currentBounty?.data?.amount}
          pullRequests={state.currentBounty?.data?.pullRequests}
        />
      );
  }

  function renderViewPullRequestLink() {
    if (isWalletConnected && 
        isGithubConnected &&
        !isBountyInDraft &&
        hasOpenPullRequest)
      return (
        <GithubLink
          forcePath={state.currentBounty?.data?.repository?.githubPath}
          hrefPath={`pull?q=base:${state.currentBounty?.data?.branch}`}
          color="primary"
        >
          <Translation ns="pull-request" label="actions.view"/>
        </GithubLink>
      );
  }

  function renderEditButton() {
    if (isWalletConnected && isBountyInDraft && isBountyOwner)
      return (
        <ReadOnlyButtonWrapper>
          <ContractButton
            className="read-only-button me-1"
            onClick={handleEditIssue}
          >
            <EditIcon className="me-1"/>
            <Translation ns="bounty" label="actions.edit-bounty" />
          </ContractButton>
        </ReadOnlyButtonWrapper>
      );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          {(!isGithubConnected && isWalletConnected) && 
          <ContextualSpan context="info" className="mb-2" isAlert>
            {t("actions.connect-github-to-work")}
          </ContextualSpan>}

          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="h4 d-flex align-items-center">
              {t("misc.details")}
            </h4>

            <div className="d-flex flex-row align-items-center gap-20">
              {!isMobile &&
                <ForksAvatars forks={state.Service?.network?.repos?.active?.forks || []}
                              repositoryPath={state.currentBounty?.data?.repository?.githubPath}/>}

              {renderHardCancelButton()}

              {renderForkRepositoryLink()}

              {renderStartWorkingButton()}

              {renderCreatePullRequestButton()}

              {renderCancelButton()}

              {renderUpdateAmountButton()}

              {renderCreateProposalButton()}

              {renderViewPullRequestLink()}

              {renderEditButton()}

              {!isGithubConnected && isWalletConnected && <ConnectGithub size="sm"/>}

              <GithubLink
                onClick={!state.Service?.network?.repos?.active?.ghVisibility ? () => setShowGHModal(true) : null}
                forcePath={state.currentBounty?.data?.repository?.githubPath}
                hrefPath={`${(state.currentBounty?.data?.state?.toLowerCase() === "pull request" && "pull") ||
                "issues"
                }/${issueGithubID || ""}`}
              >
                {t("actions.view-on-github")}
              </GithubLink>
            </div>
          </div>
        </div>
      </div>

      <BountyEffectsProvider>
        <>
          <CreatePullRequestModal
            show={showPRModal}
            title={state.currentBounty?.data?.title}
            description={state.currentBounty?.data?.body}
            onConfirm={handlePullrequest}
            repo={
              (state.currentUser?.login &&
                state.currentBounty?.data?.repository?.githubPath) &&
              state.currentBounty?.data?.repository?.githubPath ||
              ""
            }
            onCloseClick={() => setShowPRModal(false)}
          />

          <UpdateBountyAmountModal
            show={showUpdateAmount}
            transactionalAddress={state.currentBounty?.data?.transactionalToken?.address}
            bountyId={state.currentBounty?.data?.contractId}
            handleClose={() => setShowUpdateAmount(false)}
          />
        </>
      </BountyEffectsProvider>

      <Modal
        title={t("modals.gh-access.title")}
        centerTitle
        show={showGHModal}
        okLabel={t("actions.close")}
        onOkClick={() => setShowGHModal(false)}
      >
        <h5 className="text-center"><Translation ns="common" label="modals.gh-access.content"/></h5>
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
        <h5 className="text-center"><Translation ns="common" label="modals.hard-cancel.content"/></h5>
      </Modal>
    </div>
  );
}