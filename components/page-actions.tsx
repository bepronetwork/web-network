import { GetStaticProps } from "next";
import React, { useContext, useState } from "react";
import IssueAvatars from "./issue-avatars";
import Link from "next/link";
import { BeproService } from "@services/bepro-service";
import NewProposal from "./create-proposal";
import { ApplicationContext } from "@contexts/application";
import { changeLoadState } from "@reducers/change-load-state";
import GithubMicroService from "@services/github-microservice";
import { developer, IssueState, pullRequest } from "@interfaces/issue-data";
import { changeBalance } from "@contexts/reducers/change-balance";
import { addToast } from "@contexts/reducers/add-toast";
import clsx from "clsx";
import ExternalLinkIcon from "@assets/icons/external-link-icon";
import { addTransaction } from "@reducers/add-transaction";
import { TransactionTypes } from "@interfaces/enums/transaction-types";
import { updateTransaction } from "@reducers/update-transaction";
import CreatePullRequestModal from "@components/create-pull-request-modal";
import { TransactionStatus } from "@interfaces/enums/transaction-status";

interface pageActions {
  issueId: string;
  UrlGithub: string;
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
}

export default function PageActions({
  issueId,
  UrlGithub,
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
  issueCreator,
}: pageActions) {
  const {
    dispatch,
    state: { githubHandle, currentAddress, myTransactions },
  } = useContext(ApplicationContext);

  const [showPRModal, setShowPRModal] = useState(false);

  function renderIssueAvatars() {
    if (developers?.length > 0) return <IssueAvatars users={developers} />;

    if (developers?.length && state.toLowerCase() !== "draft")
      return <p className="p-small trans me-2 mt-3">no one is working </p>;
  }

  function renderForkAvatars() {
    if (forks?.length > 0) {
      return (
        <a
          className="d-flex align-items-center text-decoration-none text-white-50 mx-1"
          href="https://github.com/bepronetwork/webapp-community/network/members"
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

    await BeproService.login()
      .then(() => {
        BeproService.network.redeemIssue({ issueId }).then((txInfo) => {
          BeproService.parseTransaction(txInfo, redeemTx.payload).then(
            (block) => dispatch(updateTransaction(block))
          );
          GithubMicroService.updateIssueState(issueId, "canceled");
          BeproService.getBalance("bepro").then((bepro) =>
            dispatch(changeBalance({ bepro }))
          );
          handleBeproService();
          handleMicroService();
        });
      })
      .catch((err) => {
        dispatch(
          updateTransaction({ ...(redeemTx.payload as any), remove: true })
        );
        console.error(`Error redeeming`, err);
      });
  }

  const renderRedeem = () => {
    return (
      isIssueinDraft === true &&
      issueCreator === currentAddress &&
      !finalized && (
        <button
          className="btn btn-md btn-primary mx-1 px-4"
          disabled={isReedemButtonDisable()}
          onClick={handleRedeem}
        >
          Redeem
        </button>
      )
    );
  };

  function renderProposeDestribution() {
    return (
      !finalized &&
      pullRequests?.length > 0 &&
      githubLogin && (
        <>
          <NewProposal
            issueId={issueId}
            isFinished={finished}
            isIssueOwner={issueCreator === currentAddress}
            amountTotal={amountIssue}
            numberMergeProposals={mergeProposals}
            pullRequests={pullRequests}
            handleBeproService={handleBeproService}
            handleMicroService={handleMicroService}
          />
        </>
      )
    );
  }

  function renderPullrequest() {
    return (
      !finalized &&
      githubLogin && (
        <button
          className="btn btn-md btn-primary ms-1 px-4"
          onClick={() => setShowPRModal(true)}
          disabled={!githubHandle || !currentAddress || !canOpenPR}
        >
          Create Pull Request
        </button>
      )
    );
  }

  function viewGHButton() {
    return (
      <a
        href={`https://github.com/bepronetwork/webapp-community/issues/${
          githubId || ""
        }`}
        target="_blank"
        className="btn btn-md mx-1 px-4 bg-shadow text-white-50"
      >
        VIEW ON GITHUB{" "}
        <ExternalLinkIcon
          className="ml-1"
          height={11}
          width={11}
          color="text-white-50"
        />
      </a>
    );
  }

  function workButton() {
    return (
      <a
        target="_blank"
        href="https://github.com/bepronetwork/webapp-community/fork"
        className="btn btn-md mx-1 btn-primary px-4"
      >
        WORK ON THIS ISSUE{" "}
        <ExternalLinkIcon
          className="ml-1"
          height={11}
          width={11}
          color="text-white"
        />
      </a>
    );
  }

  async function handlePullrequest({
    title: prTitle,
    description: prDescription,
  }) {
    GithubMicroService.createPullRequestIssue(issueId, {
      title: prTitle,
      description: prDescription,
      username: githubLogin,
    })
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
        console.log("err", err.response);
        if (err.response?.status === 422 && err.response?.data) {
          err.response?.data.map((item) =>
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

    await BeproService.network
      .disputeMerge({ issueID: issueId, mergeID: mergeId })
      .then((txInfo) => {
        BeproService.parseTransaction(txInfo, disputeTx.payload).then((block) =>
          dispatch(updateTransaction(block))
        );
      })
      .then(() => handleBeproService())
      .catch((err) => {
        dispatch(
          updateTransaction({ ...(disputeTx.payload as any), remove: true })
        );
        console.log("Error creating dispute", err);
      });
  }

  async function handleClose() {
    const closeIssueTx = addTransaction({ type: TransactionTypes.closeIssue });
    dispatch(closeIssueTx);

    await BeproService.network
      .closeIssue({ issueID: issueId, mergeID: mergeId })
      .then((txInfo) => {
        BeproService.parseTransaction(txInfo, closeIssueTx.payload).then(
          (block) => dispatch(updateTransaction(block))
        );
      })
      .then(() => handleBeproService())
      .catch((err) => {
        dispatch(
          updateTransaction({ ...(closeIssueTx.payload as any), remove: true })
        );
        console.log(`Error closing issue`, err);
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
              {UrlGithub && (
                <Link href={UrlGithub}>
                  <a className="btn btn-md btn-opac mx-1" target="_blank">
                    View on github
                  </a>
                </Link>
              )}
              {viewGHButton()}
              {!isClosedIssue(state) && workButton()}
              {renderRedeem()}
              {renderProposeDestribution()}
              {!isClosedIssue(state) && renderPullrequest()}
              {state?.toLowerCase() === "pull request" && (
                <>
                  <button
                    className={clsx("btn btn-md  px-4", {
                      "btn-purple": !isDisputed,
                      "btn-primary": isDisputed,
                    })}
                    onClick={handleDispute}
                  >
                    Dispute
                  </button>

                  <button
                    className="btn btn-md btn-primary mx-3 px-4"
                    onClick={handleClose}
                  >
                    Close
                  </button>
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
