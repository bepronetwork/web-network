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
  handleMicroService?: () => void;
  handleBeproService?: () => void;
  githubLogin?: string;
  mergeId?: string;
  isDisputed?: boolean;
  canOpenPR?: boolean;
  githubId?: string;
  finished?: boolean;
  issueCreator?: string;
  repoPath?: string;
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
  canOpenPR,
  githubId = ``,
  finished = false,
  repoPath = ``,
  issueCreator,
}: pageActions) {
  const {
    dispatch,
    state: { githubHandle, currentAddress, myTransactions },
  } = useContext(ApplicationContext);
  const {query: {repoId, id}} = useRouter();
  const {createPullRequestIssue, waitForRedeem, waitForClose, processEvent} = useApi();

  const [showPRModal, setShowPRModal] = useState(false);

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
        handleBeproService(); handleMicroService();
      })

    await BeproService.login()
      .then(() => {
        BeproService.network.redeemIssue({ issueId: issue_id })
                    .then((txInfo) => {
                      processEvent(`redeem-issue`, txInfo.blockNumber, issue_id);
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
                      console.error(`Error redeeming`, err);
                    });
      }).catch((err) => {
        if (err?.message?.search(`User denied`) > -1)
          dispatch(updateTransaction({ ...(redeemTx.payload as any), remove: true }));
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
      !isIssueinDraft &&
      !finished &&
      !finalized &&
      githubLogin && (
        <Button onClick={() => setShowPRModal(true)} disabled={!githubHandle || !currentAddress || !canOpenPR}>
          Create Pull Request
        </Button>
      )
    );
  }

  async function handlePullrequest({title: prTitle, description: prDescription,}) {

    createPullRequestIssue(repoId as string, githubId, {title: prTitle, description: prDescription, username: githubLogin,})
      .then(() => {
        dispatch(
          addToast({
            type: "success",
            title: "Sucess",
            content: "Created pull request",
          })
        );
        handleMicroService();
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

  async function handleDispute() {
    const disputeTx = addTransaction({ type: TransactionTypes.dispute });
    dispatch(disputeTx);

    const issue_id = await BeproService.network.getIssueByCID({issueCID: issueId}).then(({_id}) => _id);

    await BeproService.network
      .disputeMerge({ issueID: issue_id, mergeID: mergeId })
      // .then((txInfo) => {
      //   BeproService.parseTransaction(txInfo, disputeTx.payload).then((block) =>
      //     dispatch(updateTransaction(block))
      //   );
      // })
      .then(() => handleBeproService())
      .catch((err) => {
        if (err?.message?.search(`User denied`) > -1)
          dispatch(updateTransaction({ ...(disputeTx.payload as any), remove: true }));
        console.error("Error creating dispute", err);
      });
  }

  async function handleClose() {
    const closeIssueTx = addTransaction({ type: TransactionTypes.closeIssue });
    dispatch(closeIssueTx);

    const issue_id = await BeproService.network.getIssueByCID({issueCID: issueId}).then(({_id}) => _id);

    waitForClose(issueId)
      .then(() => {
        handleBeproService(); handleMicroService();
      })

    await BeproService.network
      .closeIssue({ issueID: issue_id, mergeID: mergeId })
      .then((txInfo) => {
        processEvent(`close-issue`, txInfo.blockNumber, issue_id);

        // return BeproService.parseTransaction(txInfo, closeIssueTx.payload).then(
        //   (block) => dispatch(updateTransaction(block))
        // );
      })
      .catch((err) => {
        if (err?.message?.search(`User denied`) > -1)
          dispatch(updateTransaction({ ...(closeIssueTx.payload as any), remove: true }));
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

              <GithubLink forcePath={repoPath} hrefPath={`issues/${githubId || ""}`}>view on github</GithubLink>

              {!isClosedIssue(state) && !finished && githubLogin && <GithubLink color="primary" forcePath={repoPath} hrefPath="fork">work on this issue</GithubLink>}

              {renderRedeem()}
              {renderProposeDestribution()}
              {!isClosedIssue(state) && githubLogin && renderPullrequest()}
              {state?.toLowerCase() == "pull request" && (
                <>
                  { !isDisputed && <Button color={`${isDisputed ? 'primary': 'purple'}`} onClick={handleDispute}>Dispute</Button> || ``}
                  <Button onClick={handleClose}>Close</Button>
                </>
              )}
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
