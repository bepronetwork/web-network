import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import IssueAvatars from "./issue-avatars";
import NewProposal from "./new-proposal";

export default function PageActions() {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h4 className="h4">Details</h4>
            <div className="d-flex align-items-center">
              <IssueAvatars></IssueAvatars>
              <button className="btn btn-md btn-opac mr-1">
                View on github
              </button>
              <NewProposal />
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
