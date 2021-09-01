import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import clsx from "clsx";

export default function ProposalStepProgress({ stateIssue, amountIssue, isDisputed }) {
  const [base] = useState(500);

  const [percentage, setPercentage] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0)

  useEffect(() => {
    setPercentage((amountIssue * 100) / base);
    setProgress((amountIssue/(base*0.04))*100)
  });

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="col-md-4 mb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h4
              className={clsx("h4 m-0",{
                "text-danger": !isDisputed,
                "color-purple": isDisputed,
              })}>Falied</h4>
              <div className="smallCaption ml-5 align-items-center">
                <span
                className={clsx({
                  "text-danger": !isDisputed,
                  "color-purple": isDisputed,
                })}>{amountIssue}</span>/{base} ORACLES<span
                className={clsx({
                  "text-danger": !isDisputed,
                  "color-purple": isDisputed,
                })}>  ({percentage}%)</span>
              </div>
            </div>
    
            <div className="position-relative">
              <div className="progress">
                <div className="progress-bar" role="progressbar" style={{width: `${progress}%`}}>
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
