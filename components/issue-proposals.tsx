import { GetStaticProps } from "next";
import { useEffect, useState } from "react";

export default function IssueProposals() {
  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="content-wrapper mb-4 pb-0">
            <h3 className="smallCaption pb-3">2 Proposals</h3>
            <div className="content-list-item">
              <div className="row align-items-center">
                <div className="col-md-4">
                  <p className="p-small mb-0">PR #32 by @asantos</p>
                </div>
                <div className="col-md-4">
                  <p className="p-small mb-0">...</p>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center justify-content-end">
                    <p className="smallCaption color-purple mb-0 mr-2">
                      500 Oracles
                    </p>
                    <button className="btn btn-md btn-purple">Dispute</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-list-item">
              <div className="row align-items-center">
                <div className="col-md-4">
                  <p className="p-small mb-0">PR #32 by @asantos</p>
                </div>
                <div className="col-md-4">
                  <p className="p-small mb-0">...</p>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center justify-content-end">
                    <p className="smallCaption color-purple mb-0 mr-2">
                      500 Oracles
                    </p>
                    <button className="btn btn-md btn-purple">Dispute</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="content-list-item">
              <div className="row align-items-center">
                <div className="col-md-4">
                  <p className="p-small mb-0">PR #32 by @asantos</p>
                </div>
                <div className="col-md-4">
                  <p className="p-small mb-0">...</p>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center justify-content-end">
                    <p className="smallCaption color-purple mb-0 mr-2">
                      500 Oracles
                    </p>
                    <button className="btn btn-md btn-purple">Dispute</button>
                  </div>
                </div>
              </div>
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
