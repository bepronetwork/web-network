import { formatNumberToString } from "@helpers/formatNumber";
import { GetStaticProps } from "next";
import React from "react";
import Avatar from "./avatar";

export default function ProposalProgress({ developers = [] }) {
  return (
    <div className="container mt-up">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="content-wrapper p-0 overflow-hidden">
            <div className="d-flex align-items-center gap-1">
              {developers.map((developer, index) => (
                <div
                  key={index}
                  className={`user-block-progress d-flex flex-column align-items-center`}
                  style={{ width: `${developer.percentage}%` }}
                >
                    <Avatar
                      key={index}
                      className="mb-2"
                      userLogin={developer.githubLogin}
                      tooltip
                      />
                  
                  <p className="caption-small mb-0">
                    {formatNumberToString(developer.percentage, 0)}%
                  </p>
                </div>
              ))}
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
