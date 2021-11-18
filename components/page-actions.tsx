import { GetStaticProps } from "next";
import React, { useContext, useState } from "react";
import IssueAvatars from "./issue-avatars";
import { BeproService } from "@services/bepro-service";
import NewProposal from "./create-proposal";
import { ApplicationContext } from "@contexts/application";
import { developer, IssueState, pullRequest } from "@interfaces/issue-data";
import { changeBalance } from "@contexts/reducers/change-balance";
import { addToast } from "@contexts/reducers/add-toast";
import { addTransaction } from "@reducers/add-transaction";
import { TransactionTypes } from "@interfaces/enums/transaction-types";
import { updateTransaction } from "@reducers/update-transaction";
import CreatePullRequestModal from "@components/create-pull-request-modal";
import { TransactionStatus } from "@interfaces/enums/transaction-status";
import Button from "./button";
import GithubLink from '@components/github-link';
import {useRouter} from 'next/router';
import useApi from '@x-hooks/use-api';
import useTransactions from '@x-hooks/useTransactions';
import LockedIcon from "@assets/icons/locked-icon";
import ExternalLinkIcon from "@assets/icons/externallink";
import { START_WORKING_COMMENT } from "@helpers/constants";

interface pageActions {
  issueId: string;
  developers?: developer[];
  finalized: boolean;
  networkCID: string;
  isIssueinDraft: boolean;
  state?: IssueState | string;
  pullRequests?: pullRequest[];
  mergeProposals?: number;
  amountIssue?: string | number;
  forks?: { owner: developer }[];
  title?: string;
  description?: string;
  handleMicroService?: (force?: boolean) => void;
  handleBeproService?: (force?: boolean) => void;
  githubLogin?: string;
  mergeId?: string;
  isDisputed?: boolean;
  hasOpenPR?: boolean;
  isRepoForked?: boolean;
  isWorking?: boolean;
  canClose?: boolean;
  githubId?: string;
  finished?: boolean;
  issueCreator?: string;
  repoPath?: string;
  addNewComment?: (comment: any) => void;
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
  isDisputed,
  hasOpenPR = false,
  isRepoForked = false,
  isWorking = false,
  canClose = true,
  githubId = ``,
  finished = false,
  repoPath = ``,
  addNewComment,
  issueCreator,
}: pageActions) {
  const {
    dispatch,
    state: { githubHandle, currentAddress, myTransactions },
  } = useContext(ApplicationContext);
  const {query: {repoId, id}} = useRouter();
  const {createPullRequestIssue, waitForRedeem, waitForClose, processEvent, createRepoFork, createIssueComment} = useApi();

  const [showPRModal, setShowPRModal] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const txWindow = useTransactions();

  function renderIssueAvatars() {
    if (developers?.length > 0) return <IssueAvatars users={developers} />;

    if (developers?.length && state.toLowerCase() !== "draft")
      return <p className="p-small me-2 mt-3">no one is working </p>;
  }

  function renderForkAvatars() {
    if (forks?.length > 0) {
      return (
        <a
          className="d-flex align-items-center text-decoration-none text-white-50 mx-1"
          href={`https://github.com/${repoPath}/network/members`}
          target="_blank"
        >
          <IssueAvatars users={forks.map((item) => item.owner)} />
          <span className="me-3 fs-small">Forks</span>
        </a>
      );
    }
  }

  const isClosedIssue = (state: IssueState | string): Boolean =>
    state.toLocaleLowerCase() === "closed" ||
    state.toLocaleLowerCase() === "redeemed";
  const isReedemButtonDisable = () =>
    [
      !myTransactions.find(
        (transactions) =>
          transactions.type === TransactionTypes.redeemIssue &&
          transactions.status === TransactionStatus.pending
      ),
    ].some((values) => values === false);

  async function handleRedeem() {
    const redeemTx = addTransaction({ type: TransactionTypes.redeemIssue });
    dispatch(redeemTx);
    const issue_id = await BeproService.network.getIssueByCID({issueCID: issueId}).then(({_id}) => _id);

    waitForRedeem(issueId)
      .then(() => {
        if (handleBeproService)
          handleBeproService(true);

        if (handleMicroService)
          handleMicroService(true);
      })

    await BeproService.login()
      .then(() => {
        BeproService.network.redeemIssue({ issueId: issue_id })
                    .then((txInfo) => {
                      processEvent(`redeem-issue`, txInfo.blockNumber, issue_id);
                      txWindow.updateItem(redeemTx.payload.id, BeproService.parseTransaction(txInfo, redeemTx.payload));
                      // return BeproService.parseTransaction(txInfo, redeemTx.payload)
                      //                    .then((block) => dispatch(updateTransaction(block)))
                    })
                    .then(() => {
                      BeproService.getBalance("bepro")
                                  .then((bepro) => dispatch(changeBalance({ bepro })))
                    })
                    // .then(() => { handleBeproService(); handleMicroService(); })
                    .catch((err) => {
                      if (err?.message?.search(`User denied`) > -1)
                        dispatch(updateTransaction({ ...(redeemTx.payload as any), remove: true }));
                      else dispatch(updateTransaction({...redeemTx.payload as any, status: TransactionStatus.failed}));
                      console.error(`Error redeeming`, err);
                    });
      }).catch((err) => {
        if (err?.message?.search(`User denied`) > -1)
          dispatch(updateTransaction({ ...(redeemTx.payload as any), remove: true }));
        else dispatch(updateTransaction({...redeemTx.payload as any, status: TransactionStatus.failed}));
        console.error(`Error logging in`, err);
      })
  }

  const renderRedeem = () => {
    return (
      isIssueinDraft &&
      issueCreator === currentAddress &&
      !finalized && (
        <Button
          disabled={isReedemButtonDisable()}
          onClick={handleRedeem}
        >
          Redeem
        </Button>
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
                                  numberMergeProposals={mergeProposals}
                                  pullRequests={pullRequests}
                                  handleBeproService={handleBeproService}
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
      isWorking &&
      githubLogin && (
        <Button onClick={() => setShowPRModal(true)} disabled={!githubHandle || !currentAddress || hasOpenPR}>
          Create Pull Request
        </Button>
      )
    );
  }

  function renderForkRepository() {
    return (
      !isRepoForked &&
      githubLogin &&
      <Button 
        color="primary" 
        onClick={handleForkRepository}
        disabled={isExecuting}
      >
        <span>Fork this repository</span>
        {isExecuting ? <span className="spinner-border spinner-border-xs ml-1"/> : <ExternalLinkIcon className="ml-1" height={12} width={12} color="text-white-50"/>}
      </Button>
    )
  }

  function renderStartWorking() {
    return (
      isRepoForked &&
      !isWorking &&
      githubLogin &&
      <Button 
        color="primary" 
        onClick={handleStartWorking}
        disabled={isExecuting}
      >
        <span>Start Working</span>
        {isExecuting ? <span className="spinner-border spinner-border-xs ml-1"/> : <ExternalLinkIcon className="ml-1" height={12} width={12} color="text-white-50"/>}
      </Button>
    )
  }

  function renderViewPullrequest() {
    return (
      hasOpenPR &&
      githubLogin &&
      <GithubLink repoId={String(repoId)} forcePath={repoPath} hrefPath={`pull/${pullRequests[0]?.githubId || ""}`} color="primary">View Pull Request</GithubLink>
    )
  }

  async function handlePullrequest({title: prTitle, description: prDescription,}) {

    createPullRequestIssue(repoId as string, githubId, {title: prTitle, description: prDescription, username: githubLogin,})
      .then(() => {
        dispatch(
          addToast({
            type: "success",
            title: "Success",
            content: "Created pull request",
          })
        );

        if (handleMicroService)
          handleMicroService(true);

        setShowPRModal(false);
      })
      .catch((err) => {
        if (err.response?.status === 422 && err.response?.data) {
          err.response?.data.errors?.map((item) =>
            dispatch(
              addToast({
                type: "danger",
                title: "Failed",
                content: item.message,
              })
            )
          );
        } else {
          dispatch(
            addToast({
              type: "danger",
              title: "Failed",
              content: "To create pull request",
            })
          );
        }
      });
  }

  async function handleForkRepository() {
    setIsExecuting(true)

    createRepoFork(repoPath)
      .then(() => {
        dispatch(
          addToast({
            type: "success",
            title: "Success",
            content: "Repository forked",
          })
        )

        if (handleMicroService)
          handleMicroService(true)
        
        setIsExecuting(false)
      })
      .catch((error) => {
        dispatch(
          addToast({
            type: "danger",
            title: "Failed",
            content: "To fork the repository",
          })
        )

        setIsExecuting(false)
      })
  }

  async function handleStartWorking() {
    setIsExecuting(true)

    createIssueComment(repoPath, +githubId, START_WORKING_COMMENT)
      .then((response) => {
        dispatch(
          addToast({
            type: "success",
            title: "Success",
            content: "To start working on issue",
          })
        )

        if (addNewComment)
          addNewComment(response.data)
        
        setIsExecuting(false)
      })
      .catch((error) => {
        dispatch(
          addToast({
            type: "danger",
            title: "Failed",
            content: "To start working on issue",
          })
        )

        setIsExecuting(false)
      })
  }

  async function handleDispute() {
    const disputeTx = addTransaction({ type: TransactionTypes.dispute });
    dispatch(disputeTx);

    const issue_id = await BeproService.network.getIssueByCID({issueCID: issueId}).then(({_id}) => _id);

    await BeproService.network
      .disputeMerge({ issueID: issue_id, mergeID: mergeId })
      .then((txInfo) => {
        txWindow.updateItem(disputeTx.payload.id, BeproService.parseTransaction(txInfo, disputeTx.payload));
      })
      .then(() => handleBeproService())
      .catch((err) => {
        if (err?.message?.search(`User denied`) > -1)
          dispatch(updateTransaction({ ...(disputeTx.payload as any), remove: true }));
        else dispatch(updateTransaction({...disputeTx.payload as any, status: TransactionStatus.failed}));

        console.error("Error creating dispute", err);
      });
  }

  async function handleClose() {
    const closeIssueTx = addTransaction({ type: TransactionTypes.closeIssue });
    dispatch(closeIssueTx);

    const issue_id = await BeproService.network.getIssueByCID({issueCID: issueId}).then(({_id}) => _id);

    waitForClose(issueId)
      .then(() => {
        if (handleBeproService)
          handleBeproService(true);

        if (handleMicroService)
          handleMicroService(true);
      })

    await BeproService.network
      .closeIssue({ issueID: issue_id, mergeID: mergeId })
      .then((txInfo) => {
        processEvent(`close-issue`, txInfo.blockNumber, issue_id);
        txWindow.updateItem(closeIssueTx.payload.id, BeproService.parseTransaction(txInfo, closeIssueTx.payload));
        // return BeproService.parseTransaction(txInfo, closeIssueTx.payload).then(
        //   (block) => dispatch(updateTransaction(block))
        // );
      })
      .catch((err) => {
        if (err?.message?.search(`User denied`) > -1)
          dispatch(updateTransaction({ ...(closeIssueTx.payload as any), remove: true }));
        else dispatch(updateTransaction({...closeIssueTx.payload as any, status: TransactionStatus.failed}));
        console.error(`Error closing issue`, err);
      });
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="h4">Details</h4>
            <div className="d-flex align-items-center">
              {renderIssueAvatars()}
              {forks && renderForkAvatars()}

              {renderForkRepository()}
              {renderStartWorking()}
              {renderPullrequest()}

              {renderRedeem()}
              {renderProposeDestribution()}
              {state?.toLowerCase() == "pull request" && (
                <>
                  { (!isDisputed && !finalized ) && <Button color={`${isDisputed ? 'primary': 'purple'}`} onClick={handleDispute}>Dispute</Button> || ``}
                  {!finalized && <Button disabled={!canClose} onClick={handleClose}>
                  {!canClose && <LockedIcon width={12} height={12} className="mr-1"/>}
                    Close
                    </Button> || ``}
                </>
              )}

              {renderViewPullrequest()}
              
              {state?.toLowerCase() !== "pull request" && <GithubLink repoId={String(repoId)} forcePath={repoPath} hrefPath={`issues/${githubId || ""}`}>view on github</GithubLink>
              || ''}

            </div>
          </div>
        </div>
      </div>
      <CreatePullRequestModal
        show={showPRModal}
        title={title}
        description={description}
        onConfirm={handlePullrequest}
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
