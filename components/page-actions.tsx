import React, { useContext, useState } from "react";

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
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";
import { addToast } from "contexts/reducers/add-toast";
import { useRepos } from "contexts/repos";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";

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
  const [showUpdateAmount, setShowUpdateAmount] = useState(false);

  const {
    dispatch
  } = useContext(ApplicationContext);

  const { activeRepo } = useRepos();
  const { activeNetwork } = useNetwork();
  const { handleReedemIssue, handleCreatePullRequest } = useBepro();
  const { wallet, user, updateWalletBalance } = useAuthentication();
  const { networkIssue, activeIssue, getNetworkIssue, updateIssue } = useIssue();
  const { createPrePullRequest, cancelPrePullRequest, startWorking, processEvent } = useApi();

  const issueGithubID = activeIssue?.githubId;

  const isCouncilMember = !!wallet?.isCouncil;
  const isBountyInDraft = !!networkIssue?.isDraft;
  const isBountyFinished = !!networkIssue?.isFinished;
  const isLoggedIn = !!wallet?.address && !!user?.login;
  const isWorkingOnBounty = !!activeIssue?.working?.find((login) => login === user?.login);
  const isBountyOpen = networkIssue?.closed === false && networkIssue?.canceled === false;

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
    handleReedemIssue()
    .then(()=>{
      updateWalletBalance();
      updateBountyData();
    });
  }

  async function handlePullrequest({
    title: prTitle,
    description: prDescription,
    branch
  }): Promise<void> {
    let pullRequestPayload = undefined;

    createPrePullRequest(repoId as string, issueGithubID, {
        title: prTitle,
        description: prDescription,
        username: user?.login,
        branch
    }).then(({bountyId, originRepo, originBranch, originCID, userRepo, userBranch, cid}) => {
      pullRequestPayload = {
          repoId, 
          issueGithubId: issueGithubID, 
          bountyId,
          issueCid: originCID, 
          pullRequestGithubId: cid,
          customNetworkName: activeNetwork.name,
          creator: userRepo.split("/")[0],
          userBranch,
          userRepo
      };

      return handleCreatePullRequest(bountyId, originRepo, originBranch, originCID, userRepo, userBranch, cid);
    })
    .then(txInfo => {
      return processEvent("pull-request", "created", activeNetwork?.name, { 
        fromBlock: (txInfo as { blockNumber: number }).blockNumber 
      });
    })
    .then(() => {
      dispatch(addToast({
            type: "success",
            title: t("actions.success"),
            content: t("pull-request:actions.create.success")
      }));

      return updateBountyData();
    })
    .then(() => setShowPRModal(false))
    .catch((err) => {
      setShowPRModal(false);
      if (pullRequestPayload) cancelPrePullRequest(pullRequestPayload);

      if (err.response?.status === 422 && err.response?.data) {
        err.response?.data.errors?.map((item) =>
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
    setIsExecuting(true);

    startWorking(networkIssue?.cid, user?.login, activeNetwork?.name)
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
    if (isLoggedIn && !isBountyInDraft && !isBountyFinished && isBountyOpen && !isRepoForked)
      return (
        <GithubLink
          repoId={String(repoId)}
          forcePath={activeIssue?.repository?.githubPath}
          hrefPath="fork"
          color="primary"
        >
          <Translation label="actions.fork-repository" />
        </GithubLink> );
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
              <ForksAvatars forks={activeRepo?.forks || []} repositoryPath={activeIssue?.repository?.githubPath} />

              {renderForkRepositoryLink()}

              {/* Start Working Button */}
              { ( isLoggedIn && 
                  !isBountyInDraft && 
                  !isBountyFinished && 
                  isBountyOpen && 
                  !isWorkingOnBounty && 
                  isRepoForked ) &&
                <ReadOnlyButtonWrapper>
                  <Button
                    color="primary"
                    onClick={handleStartWorking}
                    className="read-only-button"
                    disabled={isExecuting}
                  >
                    <span>
                      <Translation ns="bounty" label="actions.start-working.title" />
                    </span>
                    {isExecuting ? (
                      <span className="spinner-border spinner-border-xs ml-1" />
                    ) : (
                      ""
                    )}
                  </Button>
                </ReadOnlyButtonWrapper>
              }

              {/* Create Pull Request Button */}
              { ( isLoggedIn && 
                  isBountyOpen && 
                  !isBountyInDraft && 
                  !isBountyFinished && 
                  isWorkingOnBounty && 
                  !hasOpenPullRequest && 
                  isRepoForked ) &&
                <ReadOnlyButtonWrapper>
                  <Button
                    className="read-only-button"
                    onClick={() => setShowPRModal(true)}
                    disabled={!user?.login || !wallet?.address || hasOpenPullRequest}
                  >
                    <Translation ns="pull-request" label="actions.create.title" />
                  </Button>
                </ReadOnlyButtonWrapper>
              }

              {/* Cancel Button */}
              { (isLoggedIn && isBountyOpen && isBountyOwner && isBountyInDraft ) &&
                <ReadOnlyButtonWrapper>
                  <Button
                    className="read-only-button me-1"
                    onClick={handleRedeem}
                  >
                    <Translation ns="common" label="actions.cancel" />
                  </Button>
                </ReadOnlyButtonWrapper>
              }

              {/* Update Amount Button */}
              { (isLoggedIn && isBountyOpen && isBountyOwner && isBountyInDraft) &&
                <ReadOnlyButtonWrapper>
                  <Button
                    className="read-only-button me-1"
                    onClick={() => setShowUpdateAmount(true)}
                  >
                    <Translation ns="bounty" label="actions.update-amount" />
                  </Button>
                </ReadOnlyButtonWrapper>
              }

              {/* Create Proposal Button */}
              { (isLoggedIn && isCouncilMember && isBountyOpen && isBountyFinished && hasPullRequests) &&
                <NewProposal
                  amountTotal={networkIssue?.tokenAmount}
                  pullRequests={activeIssue?.pullRequests}
                />
              }

              {/* View Pull Request Link */}
              { (isLoggedIn && !isBountyInDraft && hasOpenPullRequest) &&
                <GithubLink
                  repoId={String(repoId)}
                  forcePath={activeIssue?.repository?.githubPath}
                  hrefPath={`pull/${
                    activeIssue?.pullRequests?.find((pr) => pr.githubLogin === user?.login)
                      ?.githubId || ""
                  }`}
                  color="primary"
                >
                  <Translation ns="pull-request" label="actions.view" />
                </GithubLink>
              }

              <GithubLink
                repoId={String(repoId)}
                forcePath={activeIssue?.repository?.githubPath}
                hrefPath={`${
                  (activeIssue?.state?.toLowerCase() === "pull request" && "pull") ||
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
    </div>
  );
}