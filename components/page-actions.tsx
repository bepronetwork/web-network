import { GetStaticProps } from "next";
import React, { useContext, useState } from "react";
import IssueAvatars from "./issue-avatars";
import { BeproService } from "services/bepro-service";
import NewProposal from "./create-proposal";
import { ApplicationContext } from "contexts/application";
import { developer, IssueState, pullRequest } from "interfaces/issue-data";
import { changeBalance } from "contexts/reducers/change-balance";
import { addToast } from "contexts/reducers/add-toast";
import { addTransaction } from "@reducers/add-transaction";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { updateTransaction } from "@reducers/update-transaction";
import CreatePullRequestModal from "components/create-pull-request-modal";
import { TransactionStatus } from "interfaces/enums/transaction-status";
import Button from "./button";
import GithubLink from 'components/github-link';
import {useRouter} from 'next/router';
import useApi from 'x-hooks/use-api';
import useTransactions from 'x-hooks/useTransactions';
import LockedIcon from "assets/icons/locked-icon";
import Translation from "./translation";
import { useTranslation } from "next-i18next";
import { useNetwork } from "contexts/network";
import ReadOnlyButtonWrapper from "./read-only-button-wrapper";
import { IForkInfo } from "interfaces/repos-list";
import { Proposal } from "interfaces/proposal";
import useBepro from "@x-hooks/use-bepro";
import { useIssue } from "@contexts/issue";

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
  addNewComment?: (comment: any) => void;
  issueRepo?: string;
  isDisputable?: boolean;
  onCloseEvent?: () => Promise<any>;
}

export default function PageActions({
  issueId,
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
  mergeProposals,
  handleMicroService,
  handleBeproService,
  githubLogin,
  mergeId,
  hasOpenPR = false,
  isRepoForked = false,
  isWorking = false,
  canClose = true,
  githubId = ``,
  finished = false,
  repoPath = ``,
  addNewComment,
  issueCreator,
  isDisputable = false,
  onCloseEvent,
}: pageActions) {
  const {
    dispatch,
    state: { githubHandle, currentAddress, myTransactions },
  } = useContext(ApplicationContext);
  const {query: {repoId, id}} = useRouter();
  const {createPullRequestIssue, waitForRedeem, waitForClose, processEvent, startWorking} = useApi();
  const { t } = useTranslation(['common', 'pull-request', 'bounty'])
  const {handleReedemIssue} = useBepro()
  const {networkIssue} = useIssue()
  const [showPRModal, setShowPRModal] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const txWindow = useTransactions();
  const { activeNetwork } = useNetwork()

  function renderIssueAvatars() {
    if (developers?.length > 0) return <IssueAvatars users={developers} />;

    if (developers?.length && state.toLowerCase() !== "draft")
      return <p className="p-small me-2 mt-3"><Translation ns="bounty" label="errors.no-workers" /></p>;
  }

  function renderForkAvatars() {
    if (forks?.length > 0) {
      return (
        <a
          className="d-flex align-items-center text-decoration-none text-white-50 mx-1"
          href={`https://github.com/${repoPath}/network/members`}
          target="_blank"
        >
          <IssueAvatars users={forks} />
          <span className="me-3 caption-small"><Translation label="misc.forks" /></span>
        </a>
      );
    }
  }

  const isClosedIssue = (state: IssueState | string): Boolean =>
    state?.toLocaleLowerCase() === "closed" ||
    state?.toLocaleLowerCase() === "redeemed";
  const isReedemButtonDisable = () =>
    [
      !myTransactions.find(
        (transactions) =>
          transactions.type === TransactionTypes.redeemIssue &&
          transactions.status === TransactionStatus.pending
      ),
    ].some((values) => values === false);

  async function handleRedeem() {
    handleReedemIssue(networkIssue._id).then(()=>{
      //TODO: Move to useAuth balance;
      BeproService.getBalance("bepro")
                                  .then((bepro) => dispatch(changeBalance({ bepro })))
    })
  }

  const renderRedeem = () => {
    return (
      isIssueinDraft &&
      issueCreator === currentAddress &&
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

  function renderProposeDestribution() {
    return (
      !finalized &&
      pullRequests?.length > 0 &&
      githubLogin && <NewProposal issueId={issueId}
                                  isFinished={finished}
                                  isIssueOwner={issueCreator == currentAddress}
                                  amountTotal={amountIssue}
                                  mergeProposals={mergeProposals}
                                  pullRequests={pullRequests}
                                  handleMicroService={handleMicroService}/>
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
      githubLogin && (
        <ReadOnlyButtonWrapper>
        <Button className="mr-1 read-only-button" onClick={() => setShowPRModal(true)} disabled={!githubHandle || !currentAddress || hasOpenPR}>
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
      githubLogin &&
      <GithubLink
        repoId={String(repoId)}
        forcePath={repoPath}
        hrefPath="fork"
        color="primary"
      >
        <Translation label="actions.fork-repository" />
      </GithubLink>
    )
  }

  function renderStartWorking() {
    return (
      isRepoForked &&
      !isWorking &&
      !isIssueinDraft &&
      !finished &&
      !finalized &&
      githubLogin &&
      <ReadOnlyButtonWrapper>
      <Button
        color="primary"
        onClick={handleStartWorking}
        className="mr-1 read-only-button"
        disabled={isExecuting}
      >
        <span><Translation ns="bounty" label="actions.start-working.title" /></span>
        {isExecuting ? <span className="spinner-border spinner-border-xs ml-1"/> : ''}
      </Button>
      </ReadOnlyButtonWrapper>
    )
  }

  function renderViewPullrequest() {
    return (
      !isIssueinDraft &&
      hasOpenPR &&
      githubLogin &&
      <GithubLink repoId={String(repoId)} forcePath={repoPath} hrefPath={`pull/${pullRequests?.find(pr => pr.githubLogin === githubLogin)?.githubId || ""}`} color="primary"><Translation ns="pull-request" label="actions.view" /></GithubLink>
    )
  }

  async function handlePullrequest({title: prTitle, description: prDescription, branch}): Promise<void> {
    return new Promise((resolve, reject) => {
        createPullRequestIssue(repoId as string, githubId, {title: prTitle, description: prDescription, username: githubLogin, branch})
        .then(() => {
          dispatch(
            addToast({
              type: "success",
              title: t('actions.success'),
              content: t('pull-request:actions.create.success'),
            })
          );

          if (handleMicroService)
            handleMicroService(true);

          setShowPRModal(false);
          resolve()
        })
        .catch((err) => {
          if (err.response?.status === 422 && err.response?.data) {
            err.response?.data.errors?.map((item) =>
              dispatch(
                addToast({
                  type: "danger",
                  title: t('actions.failed'),
                  content: item.message,
                })
              )
            );
            reject(err)
          } else {
            dispatch(
              addToast({
                type: "danger",
                title: t('actions.failed'),
                content: t('pull-request:actions.create.error'),
              })
            );
            reject()
          }
        });
    }) 
  }

  async function handleStartWorking() {
    setIsExecuting(true)

    startWorking(networkCID, githubLogin, activeNetwork?.name)
      .then((response) => {
        dispatch(
          addToast({
            type: "success",
            title: t('actions.success'),
            content: t('bounty:actions.start-working.success'),
          })
        )

        if (handleMicroService)
          handleMicroService(true)

        if (addNewComment)
          addNewComment(response.data)

        setIsExecuting(false)
      })
      .catch((error) => {
        console.log(`Failed to start working`, error)
        dispatch(
          addToast({
            type: "danger",
            title: t('actions.failed'),
            content: t('bounty:actions.start-working.error'),
          })
        )

        setIsExecuting(false)
      })
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="h4 d-flex align-items-center">{t('misc.details')}</h4>
            <div className="d-flex align-items-center">
              {!canClose && !finalized && <span className="mr-2 caption-small text-danger">{t('pull-request:errors.merge-conflicts')}</span> || ``}
              {renderIssueAvatars()}
              {forks && renderForkAvatars()}

              {renderForkRepository()}
              {renderStartWorking()}
              {renderPullrequest()}

              {renderRedeem()}
              {renderProposeDestribution()}
              {state?.toLowerCase() == "pull request" && (
                <>
                  {!finalized && <ReadOnlyButtonWrapper><Button className="read-only-button mr-1" disabled={!canClose || isDisputable} onClick={handleClose}>
                  {!canClose || isDisputable && <LockedIcon width={12} height={12} className="mr-1"/>}
                    <span>{t('pull-request:actions.merge.title')}</span>
                    </Button></ReadOnlyButtonWrapper> || ``}
                </>
              )}

              {renderViewPullrequest()}

              <GithubLink repoId={String(repoId)} forcePath={repoPath} hrefPath={`${state?.toLowerCase() === 'pull request' && 'pull' || 'issues' }/${githubId || ""}`}>{t('actions.view-on-github')}</GithubLink>

            </div>
          </div>
        </div>
      </div>
      <CreatePullRequestModal
        show={showPRModal}
        title={title}
        description={description}
        onConfirm={handlePullrequest}
        repo={githubLogin && repoPath && [githubLogin, repoPath.split(`/`)[1]].join(`/`) || ``}
        onCloseClick={() => setShowPRModal(false)}
      />
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
