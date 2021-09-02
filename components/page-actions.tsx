import {GetStaticProps} from 'next';
import React, {useContext} from 'react';
import IssueAvatars from './issue-avatars';
import Link from 'next/link';
import {BeproService} from '@services/bepro-service';
import NewProposal from './create-proposal';
import {ApplicationContext} from '@contexts/application';
import {changeLoadState} from '@reducers/change-load-state';
import GithubMicroService from '@services/github-microservice';
import {developer, pullRequest} from '@interfaces/issue-data';
import {changeBalance} from '@contexts/reducers/change-balance';
import {addToast} from '@contexts/reducers/add-toast';
import clsx from 'clsx';
import {addTransaction} from '@reducers/add-transaction';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import {updateTransaction} from '@reducers/update-transaction';

interface pageActions {
  issueId: string;
  UrlGithub: string;
  developers?: developer[];
  finalized: boolean;
  addressNetwork: string;
  isIssueinDraft: boolean;
  state?: string;
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
}

export default function PageActions({
  issueId,
  UrlGithub,
  developers,
  finalized,
  addressNetwork,
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
}: pageActions) {
  const {
    dispatch,
    state: { githubHandle, currentAddress },
  } = useContext(ApplicationContext);

  function handleAvatar() {
    if (developers?.length > 0) {
      return <IssueAvatars users={developers}></IssueAvatars>;
    } else if (developers?.length && state.toLowerCase() !== "draft") {
      return <p className="p-small trans me-2 mt-3">no one is working </p>;
    }
  }

  function handleFork() {
    if (forks?.length > 0) {
      return (
        <>
          <IssueAvatars users={forks.map((item) => item.owner)}></IssueAvatars>
          <p className="mb-1 me-2">Forks</p>
        </>
      );
    }
  }

  async function handleRedeem() {

    const redeemTx = addTransaction({type: TransactionTypes.redeemIssue})

    await BeproService.login()
      .then(() => {
        BeproService.network.redeemIssue({issueId,})
                    .then(txInfo => {
                      BeproService.parseTransaction(txInfo, redeemTx.payload)
                                  .then(block => dispatch(updateTransaction(block)));
                      BeproService.getBalance("bepro")
                                  .then((bepro) => dispatch(changeBalance({ bepro })));
                      handleBeproService();
                    })
      })
      .catch((err) => {
        dispatch(updateTransaction({...redeemTx.payload as any, remove: true}));
        console.error(`Error redeeming`, err)
      })
  }

  const renderRedeem = () => {
    return (
      isIssueinDraft === true &&
      addressNetwork === currentAddress &&
      !finalized && (
        <button
          className="btn btn-md btn-primary mx-1 px-4"
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
          onClick={handlePullrequest}
          disabled={!githubHandle || !currentAddress}
        >
          Create Pull Request
        </button>
      )
    );
  }

  async function handlePullrequest() {
    GithubMicroService.createPullRequestIssue(issueId, {
      title: title,
      description: description,
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
    const disputeTx = addTransaction({type: TransactionTypes.dispute});
    dispatch(disputeTx);

    await BeproService.network.disputeMerge({issueID: issueId, mergeID: mergeId,})
                      .then(txInfo => {
                        BeproService.parseTransaction(txInfo, disputeTx.payload)
                                    .then(block => dispatch(updateTransaction(block)));
                      })
                      .then(() => handleBeproService())
                      .catch((err) => {
                        dispatch(updateTransaction({...disputeTx.payload as any, remove: true}));
                        console.log("Error creating dispute", err)
                      })
  }

  async function handleClose() {
    const closeIssueTx = addTransaction({type: TransactionTypes.closeIssue});
    dispatch(closeIssueTx);

    await BeproService.network.closeIssue({issueID: issueId, mergeID: mergeId,})
                      .then(txInfo => {
                        BeproService.parseTransaction(txInfo, closeIssueTx.payload)
                                    .then(block => dispatch(updateTransaction(block)));
                      })
                      .then(() => handleBeproService())
                      .catch((err) => {
                        dispatch(updateTransaction({...closeIssueTx.payload as any, remove: true}));
                        console.log(`Error closing issue`, err);
                      })
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="h4">Details</h4>
            <div className="d-flex align-items-center">
              {handleAvatar()}
              {forks && handleFork()}
              {UrlGithub && (
                <Link href={UrlGithub}>
                  <a className="btn btn-md btn-opac me-3" target="_blank" >View on github</a>
                </Link>
              )}
              {renderRedeem()}
              {renderProposeDestribution()}
              {renderPullrequest()}
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
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
