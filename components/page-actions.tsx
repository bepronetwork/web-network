import { GetStaticProps } from "next";
import React, { useContext, } from "react";
import IssueAvatars from "./issue-avatars";
import CreateProposal from "./create-proposal";
import Link from "next/link";
import { BeproService } from '@services/bepro-service';
import NewProposal from "./create-proposal";
import { ApplicationContext } from '@contexts/application';
import { changeLoadState } from '@reducers/change-load-state';
import GithubMicroService from "../services/github-microservice";
import { developer, pullRequest } from "interfaces/issue-data";
import { addToast } from "contexts/reducers/add-toast";

interface pageActions {
  issueId: string,
  UrlGithub: string,
  developers?: developer[],
  userAddress: string,
  finalized: boolean,
  addressNetwork: string,
  isIssueinDraft: boolean,
  state?: string,
  pullRequests?: pullRequest[],
  amountIssue?: string | number,
  mergeProposals?: number,
  forks?: [],
  title?: string,
  description?: string,
  handleNetworkIssue?: () => Promise<void>
}

export default function PageActions({
  issueId,
  UrlGithub,
  developers,
  userAddress,
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
  handleNetworkIssue,
}: pageActions) {
  const {
    dispatch,
    state: { githubHandle },
  } = useContext(ApplicationContext);

  function handleAvatar() {
    if (developers?.length > 0) {
      return <IssueAvatars users={developers}></IssueAvatars>;
    } else if (developers?.length && state.toLowerCase() !== "draft") {
      return <p className="p-small trans me-2 mt-3">no one is working </p>;
    }
  }

  async function handleRedeem() {
    dispatch(changeLoadState(true));
    await BeproService.login()
      .then(() =>
        BeproService.network.redeemIssue({
          issueId,
        })
      )
      .catch((err) => console.log(err))
      .finally(() => dispatch(changeLoadState(false)));
  }

  const renderRedeem = () => {
    return (
      isIssueinDraft === true &&
      addressNetwork === userAddress && (
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
      pullRequests?.length > 0 && (
        <>
          <NewProposal
            issueId={issueId}
            amountTotal={amountIssue}
            numberMergeProposals={mergeProposals}
            pullRequests={pullRequests}
          />
        </>
      )
    );
  }

  function renderPullrequest() {
    return (
      !finalized && (
        <button
          className="btn btn-md btn-primary ms-1 px-4"
          onClick={handlePullrequest}
          disabled={!githubHandle}
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
      username: githubHandle,
    })
      .then(() => handleNetworkIssue())
      .catch((err) => dispatch(addToast({type: 'danger', content:'failed to create pull request'})));
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="h4">Details</h4>
            <div className="d-flex align-items-center">
              {handleAvatar()}
              {forks && <span className="p-1 mx-2">+{forks.length} FORKS</span>}
              {UrlGithub && (
                <Link href={UrlGithub}>
                  <a className="btn btn-md btn-opac mx-1">View on github</a>
                </Link>
              )}
              {renderRedeem()}
              {state.toLowerCase() === "ready" && (
                <CreateProposal
                  issueId={issueId}
                  numberMergeProposals={mergeProposals}
                  amountTotal={amountIssue}
                  pullRequests={pullRequests}
                />
              )}
              {renderProposeDestribution()}
              {renderPullrequest()}
              {state.toLowerCase() === "pull request" && (
                <button className="btn btn-md btn-primary mx-1 px-4">
                  Dispute
                </button>
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
