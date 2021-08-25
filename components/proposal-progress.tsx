import { GetStaticProps } from "next";
import React from "react";
import Avatar from "./avatar";

export default function ProposalProgress({ developers }) {
  return (
    <div className="container mt-up">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="content-wrapper p-0 overflow-hidden mb-4">
            <div className="d-flex align-items-center">
              {developers?.map((developer, index) => (
                <>
                  <div
                    key={index}
                    className={`user-block-progress d-flex flex-column align-items-center`}
                    style={{ width: `${developer.percentage}%` }}
                  >
                    <Avatar
                      key={index}
                      className="mb-1"
                      userLogin={developer.githubLogin}
                    />
                    <p className="p-small mb-0">
                      {developer.percentage}% @{developer.githubLogin}
                    </p>
                  </div>
                  {index + 1 < developers.length && <>&nbsp;&nbsp;</>}
                </>
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
