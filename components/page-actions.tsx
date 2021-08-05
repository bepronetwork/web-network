import { GetStaticProps } from "next";
import React, { useContext, useEffect, useState } from "react";
import IssueAvatars from "./issue-avatars";
import CreateProposal from "./create-proposal";
import StartWorking from "./start-working";
import OpenIssue from "./open-issue";
import Link from "next/link";
import BeproService from "../services/bepro";
import NewProposal from "./create-proposal";

import { ApplicationContext } from "../contexts/application";
import { changeLoadState } from "../contexts/reducers/change-load-state";
import GithubMicroService from "../services/github-microservice";

export default function PageActions({
  issueId,
  UrlGithub,
  developers,
  userAddress,
  finalized,
  addressNetwork,
  isIssueinDraft,
  state,
}) {
  const { dispatch } = useContext(ApplicationContext);

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
      !finalized && (
        <>
          <NewProposal issueId={issueId} amountTotal={"1000"} />
          <button
            className="btn btn-md btn-primary ms-1 px-4"
            onClick={handlePullrequest}
          >
            Create Pull Request
          </button>
        </>
      )
    );
  }

  async function handlePullrequest() {
    //todo need logic
    console.log("Construction...");
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="h4">Details</h4>
            <div className="d-flex align-items-center">
              {handleAvatar()}
              {UrlGithub && (
                <Link href={UrlGithub}>
                  <a className="btn btn-md btn-opac mx-1">View on github</a>
                </Link>
              )}
              {renderRedeem()}
              {state.toLowerCase() === "ready" && (
                <CreateProposal issueId={issueId} amountTotal={"1000"} />
              )}
              {renderProposeDestribution()}
              {state.toLowerCase() === "pull request" && (
                <button className="btn btn-md btn-primary mx-1 px-4">
                  Dispute
                </button>
              )}

              {/*<OpenIssue />*/}
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
