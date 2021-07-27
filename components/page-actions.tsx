import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import IssueAvatars from "./issue-avatars";
import CreateProposal from "./create-proposal";
import StartWorking from "./start-working";
import OpenIssue from "./open-issue";
import Link from "next/link";

export default function PageActions({ issue }) {
  const handleAvatar = () => {
    if (issue?.developers.length > 0) {
      return <IssueAvatars users={issue?.developers}></IssueAvatars>;
    } else if (
      issue?.developers.length &&
      issue?.state.toLowerCase() !== "draft"
    ) {
      return <p className="p-small trans me-2 mt-3">no one is working </p>;
    }
  };

  const handleStartworking = () => {
    return (
      (issue?.state.toLowerCase() === "open" ||
        issue?.state.toLowerCase() === "in progress") && <StartWorking />
    );
  };

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="h4">Details</h4>
            <div className="d-flex align-items-center">
              {handleAvatar()}
              {issue?.url && (
                <Link href={issue?.url}>
                  <a className="btn btn-md btn-opac mr-1">View on github</a>
                </Link>
              )}
              {handleStartworking()}
              {issue?.state.toLowerCase() === "ready" && <CreateProposal />}

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
