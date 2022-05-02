import React, { useContext, useState } from "react";

import { GetStaticProps } from "next";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import Button from "components/button";
import NewProposal from "components/create-proposal";
import CreatePullRequestModal from "components/create-pull-request-modal";
import GithubLink from "components/github-link";
import IssueAvatars from "components/issue-avatars";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import Translation from "components/translation";
import UpdateBountyAmountModal from "components/update-bounty-amount-modal";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";
import { addToast } from "contexts/reducers/add-toast";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { developer, IssueState, pullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";
import { IForkInfo } from "interfaces/repos-list";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";


interface pageActions {
  issueId: string;
  developers?: developer[];
  finalized: boolean;
  networkCID: string;
  isIssueinDraft: boolean;
  state?: IssueState | string;
  pullRequests?: pullRequest[];
  mergeProposals?: Proposal[];
  amountIssue?: string | number;
  forks?: IForkInfo[];
  title?: string;
  description?: string;
  handleMicroService?: (force?: boolean) => void;
  handleBeproService?: (force?: boolean) => void;
  githubLogin?: string;
  mergeId?: string;
  hasOpenPR?: boolean;
  isRepoForked?: boolean;
  isWorking?: boolean;
  canClose?: boolean;
  githubId?: string;
  finished?: boolean;
  issueCreator?: string;
  repoPath?: string;
  addNewComment?: (comment: string) => void;
  issueRepo?: string;
  isDisputable?: boolean;
  onCloseEvent?: () => void;
}

export default function PageActions({
  developers,
  finalized,
  networkCID,
  isIssueinDraft,
  state,
  pullRequests,
  amountIssue,
  forks,
  title,
  description,
  handleMicroService,
  githubLogin,
  hasOpenPR = false,
  isRepoForked = false,
  isWorking = false,
  canClose = true,
  githubId = "",
  finished = false,
  repoPath = "",
  addNewComment,
  issueCreator
}: pageActions) {
  const {
    query: { repoId, id }
  } = useRouter();
  const { t } = useTranslation(["common", "pull-request", "bounty"]);

  const [isExecuting, setIsExecuting] = useState(false);
  const [showPRModal, setShowPRModal] = useState(false);
  const [showUpdateAmount, setShowUpdateAmount] = useState(false);

  const {
    dispatch,
    state: { myTransactions }
  } = useContext(ApplicationContext);
  const { activeNetwork } = useNetwork();
  const { wallet, user, updateWalletBalance } = useAuthentication();
  const { handleReedemIssue, handleCreatePullRequest } = useBepro();
  const { updateIssue, networkIssue, activeIssue } = useIssue();

  const { createPrePullRequest, cancelPrePullRequest, startWorking, processEvent } = useApi();

  const isBountyOwner = () => issueCreator?.toLowerCase() === wallet?.address.toLowerCase();

  const isBountyOwner = () => issueCreator?.toLowerCase() === wallet?.address.toLowerCase();

  function renderIssueAvatars() {
    if (developers?.length > 0) return <IssueAvatars users={developers} />;

    if (developers?.length && state.toLowerCase() !== "draft")
      return (
        <p className="p-small mt-3">
          <Translation ns="bounty" label="errors.no-workers" />
        </p>
      );
  }

  function renderForkAvatars() {
    if (forks?.length > 0) {
      return (
        <a
          className="d-flex align-items-center text-decoration-none text-white-50"
          href={`https://github.com/${repoPath}/network/members`}
          target="_blank"
          rel="noreferrer"
        >
          <IssueAvatars users={forks} />
          <span className="caption-small">
            <Translation label="misc.forks" />
          </span>
        </a>
      );
    }
  }

  const isClosedIssue = (state: IssueState | string): boolean =>
    state?.toLocaleLowerCase() === "closed" ||
    state?.toLocaleLowerCase() === "redeemed";
  const isReedemButtonDisable = () =>
    [
      !myTransactions.find((transactions) =>
          transactions.type === TransactionTypes.redeemIssue &&
          transactions.status === TransactionStatus.pending)
    ].some((values) => values === false);

  async function handleRedeem() {
    handleReedemIssue()
                      .then(()=>{
                        updateIssue(`${repoId}`, `${id}`);
                        updateWalletBalance()
                      });
  }

  const renderRedeem = () => {
    return (
      isIssueinDraft &&
      isBountyOwner() &&
      !finalized && (
        <ReadOnlyButtonWrapper>
          <Button
            className="read-only-button me-1"
            disabled={isReedemButtonDisable()}
            onClick={handleRedeem}
          >
            <Translation ns="bounty" label="actions.redeem" />
          </Button>
        </ReadOnlyButtonWrapper>
      )
    );
  };

  const renderUpdateAmount = () => {
    if (isIssueinDraft && isBountyOwner())
      return <ReadOnlyButtonWrapper>
        <Button
          className="read-only-button me-1"
          onClick={() => setShowUpdateAmount(true)}
        >
          <Translation ns="bounty" label="Update Amount" />
        </Button>
      </ReadOnlyButtonWrapper>;

    return <></>;
  }

  function renderProposeDestribution() {
    return (
      !finalized &&
      pullRequests?.length > 0 &&
      wallet?.address &&
      user?.login && (
        <NewProposal
          isFinished={finished}
          isIssueOwner={isBountyOwner()}
          amountTotal={amountIssue}
          pullRequests={pullRequests}
        />
      )
    );
  }

  function renderPullrequest() {
    return (
      !isClosedIssue(state) &&
      !isIssueinDraft &&
      !finished &&
      !finalized &&
      !hasOpenPR &&
      isRepoForked &&
      isWorking &&
      wallet?.address &&
      user?.login && (
        <ReadOnlyButtonWrapper>
          <Button
            className="read-only-button"
            onClick={() => setShowPRModal(true)}
            disabled={!user?.login || !wallet?.address || hasOpenPR}
          >
            <Translation ns="pull-request" label="actions.create.title" />
          </Button>
        </ReadOnlyButtonWrapper>
      )
    );
  }

  function renderForkRepository() {
    return (
      !isRepoForked &&
      !isIssueinDraft &&
      !finished &&
      !finalized &&
      wallet?.address &&
      user?.login && (
        <GithubLink
          repoId={String(repoId)}
          forcePath={repoPath}
          hrefPath="fork"
          color="primary"
        >
          <Translation label="actions.fork-repository" />
        </GithubLink>
      )
    );
  }

  function renderStartWorking() {
    return (
      isRepoForked &&
      !isWorking &&
      !isIssueinDraft &&
      !finished &&
      !finalized &&
      wallet?.address &&
      user?.login && (
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
      )
    );
  }

  function renderViewPullrequest() {
    return (
      !isIssueinDraft &&
      hasOpenPR &&
      githubLogin && (
        <GithubLink
          repoId={String(repoId)}
          forcePath={repoPath}
          hrefPath={`pull/${
            pullRequests?.find((pr) => pr.githubLogin === githubLogin)
              ?.githubId || ""
          }`}
          color="primary"
        >
          <Translation ns="pull-request" label="actions.view" />
        </GithubLink>
      )
    );
  }

  async function handlePullrequest({
    title: prTitle,
    description: prDescription,
    branch
  }): Promise<void> {
    let pullRequestPayload = undefined;

    createPrePullRequest(repoId as string, githubId, {
        title: prTitle,
        description: prDescription,
        username: githubLogin,
        branch
    }).then(({bountyId, originRepo, originBranch, originCID, userRepo, userBranch, cid}) => {
      pullRequestPayload = {
          repoId, 
          issueGithubId: githubId, 
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
      return processEvent("pull-request", "created", activeNetwork?.name, { fromBlock: (txInfo as any).blockNumber });
    })
    .then(() => {
      dispatch(addToast({
            type: "success",
            title: t("actions.success"),
            content: t("pull-request:actions.create.success")
      }));

      if (handleMicroService) handleMicroService(true);

      setShowPRModal(false);
    })
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

    startWorking(networkCID, githubLogin, activeNetwork?.name)
      .then((response) => {
        dispatch(addToast({
            type: "success",
            title: t("actions.success"),
            content: t("bounty:actions.start-working.success")
        }));

        if (handleMicroService) handleMicroService(true);

        if (addNewComment) addNewComment(response.data);

        setIsExecuting(false);
      })
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

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="h4 d-flex align-items-center">
              {t("misc.details")}
            </h4>
            <div className="d-flex flex-row align-items-center gap-20">
              {(!canClose && !finalized && (
                <span className="caption-small text-danger">
                  {t("pull-request:errors.merge-conflicts")}
                </span>
              )) ||
                ""}
              {renderIssueAvatars()}
              {forks && renderForkAvatars()}

              {renderForkRepository()}
              {renderStartWorking()}
              {renderPullrequest()}

              {renderRedeem()}
              {renderUpdateAmount()}
              {renderProposeDestribution()}

              {renderViewPullrequest()}

              <GithubLink
                repoId={String(repoId)}
                forcePath={repoPath}
                hrefPath={`${
                  (state?.toLowerCase() === "pull request" && "pull") ||
                  "issues"
                }/${githubId || ""}`}
              >
                {t("actions.view-on-github")}
              </GithubLink>
            </div>
          </div>
        </div>
      </div>
      <CreatePullRequestModal
        show={showPRModal}
        title={title}
        description={description}
        onConfirm={handlePullrequest}
        repo={
          (githubLogin &&
            repoPath &&
            [githubLogin, repoPath.split("/")[1]].join("/")) ||
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

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  };
};
