import { GetStaticProps } from "next";
import React, { useContext } from "react";
import IssueAvatars from "./issue-avatars";
import Link from "next/link";
import { BeproService } from "../services/bepro-service";
import NewProposal from "./create-proposal";
import { ApplicationContext } from "../contexts/application";
import { changeLoadState } from "../contexts/reducers/change-load-state";
import GithubMicroService from "../services/github-microservice";
import { developer, pullRequest } from "interfaces/issue-data";
import { changeBalance } from "contexts/reducers/change-balance";

interface pageActions {
  issueId: string;
  UrlGithub: string;
  developers?: developer[];
  finalized: boolean;
  addressNetwork: string;
  isIssueinDraft: boolean;
  state?: string;
  pullRequests?: pullRequest[];
  amountIssue?: string | number;
  forks?: { owner: developer }[];
  title?: string;
  description?: string;
  handleNetworkIssue?: () => void;
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
  handleNetworkIssue,
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
    dispatch(changeLoadState(true));
    await BeproService.login()
      .then(() => {
        BeproService.network
          .redeemIssue({
            issueId,
          })
          .then(() =>
            BeproService.getBalance("bepro").then((bepro) =>
              dispatch(changeBalance({ bepro }))
            )
          );
      })
      .catch((err) => console.log(err))
      .finally(() => dispatch(changeLoadState(false)));
  }

  const renderRedeem = () => {
    return (
      isIssueinDraft === true &&
      addressNetwork === currentAddress && (
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
      username: githubHandle,
    })
      .then(() => handleNetworkIssue())
      .catch((err) => console.log("err", err));
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
                  <a className="btn btn-md btn-opac mx-1">View on github</a>
                </Link>
              )}
              {renderRedeem()}
              {renderProposeDestribution()}
              {renderPullrequest()}
              {state?.toLowerCase() === "pull request" && (
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
