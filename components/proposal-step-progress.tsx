import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";

export default function ProposalStepProgress({ stateIssue, amountIssue }) {
  const [base] = useState(500);

  const [percentage, setPercentage] = useState("");

  useEffect(() => {
    setPercentage(`${(8 * 100) / base}`);
  });

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="col-md-4 mb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h4 className="h4 m-0">Falied</h4>
              <div className="smallCaption ml-5">
                <span>50</span>/{base} ORACLES<span>({percentage}%)</span>
              </div>
            </div>
    
            <div className="position-relative">
              <div className="progress">
                <div className="progress-bar" role="progressbar" style={{width: "150%"}}>
                  <div className="d-flex align-items-center flex-column step">
                    <div className="rounded-circle step-ball"></div>
                    <span className="caption mt-3 p-0">0%</span>
                  </div>
                  <div className="d-flex align-items-center flex-column step">
                    <div className="rounded-circle step-ball"></div>
                    <span className="caption mt-3 p-0">1%</span>
                  </div>
                  <div className="d-flex align-items-center flex-column step">
                    <div className="rounded-circle step-ball"></div>
                    <span className="caption mt-3 p-0">2%</span>
                  </div>
                  <div className="d-flex align-items-center flex-column step">
                    <div className="rounded-circle step-ball"></div>
                    <span className="caption mt-3 p-0">3%</span>
                  </div>
                  <div className="d-flex align-items-center flex-column step">
                    <div className="rounded-circle step-ball bg-transparent"></div>
                    <span className="caption mt-3 p-0">{'>3%'}</span>
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
