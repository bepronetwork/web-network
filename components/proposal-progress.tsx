import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import { ProgressBar } from "react-bootstrap";

export default function ProposalProgress({ developers }) {
  return (
    <div className="container mt-up">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="content-wrapper p-0 overflow-hidden mb-4">
            <div className="d-flex align-items-center">
              {developers.map((developer, index) => (
                <div
                  key={developer.user.id}
                  className={`user-block-progress d-flex flex-column align-items-center`}
                  style={{ width: `${developer.value}%` }}
                >
                  <img
                    className="avatar circle-2 mb-1"
                    src={developer.user.avatar_url}
                    alt=""
                  />
                  <p className="p-small mb-0">
                    {developer.value}% @{developer.user.login}
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
