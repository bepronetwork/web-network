import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { differenceInDays } from 'date-fns'
import {
  handlePercentage,
  handlePercentToRange,
  handlePercentToSteps
} from "@helpers/handlePercentage";

export type StateIssue = "Failed" | "Accepted" | "Open for dispute";
export default function ProposalStepProgress({ amountIssue, isDisputed, createdAt }) {
  const [total] = useState<number>(500);
  const [stateIssue, setStateIssue] = useState<StateIssue>("Open for dispute");
  const [percentage, setPercentage] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [steps, setSteps] = useState<number[]>([]);


  const handlerColorState = () => {
    if (isDisputed) {
      return "purple";
    }
    if (!isDisputed) {
      return "red";
    }
    return "success";
  };

  const handlerState = () => {
    const daysAgo = differenceInDays(
      new Date(),
      new Date(createdAt)
    )
    if (daysAgo < 3 && isDisputed) {
      setStateIssue('Accepted')
    }
    else if (daysAgo >= 3 && !isDisputed) {
      setStateIssue('Failed')
    }else{
      setStateIssue('Open for dispute')
    }

  };
  useEffect(handlerState, [isDisputed, createdAt])

  useEffect(() => {
    setPercentage(handlePercentage(amountIssue, total)|| 0);
    setProgress(handlePercentToRange(amountIssue, total, 4)|| 0);
    const increment = handlePercentToSteps(amountIssue, total)
    setSteps([
      0,
      increment,
      increment*2,
      increment*3,
    ])

  }, [amountIssue, total]);

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="col-md-6 mb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h4 className={`h4 m-0 text-capitalize color-${handlerColorState()}`}>
                {stateIssue}
              </h4>
              <div className="smallCaption ml-5 align-items-center">
                <span className={`color-${handlerColorState()}`}>
                  {amountIssue}
                </span>
                /{total} ORACLES
                <span className={`color-${handlerColorState()}`}>
                  ({percentage}%)
                </span>
              </div>
            </div>
            <div className="position-relative p-1">
              <div className="progress bg-dark">
                <div
                  className={`progress-bar bg-${handlerColorState()}`}
                  role="progressbar"
                  style={{ width: `${progress}%` }}>
                  <div className="position-absolute step step-0 d-flex align-items-center flex-column">
                    <div
                      className={clsx(
                        "rounded-circle step-dots",
                        `bg-${handlerColorState()}`,
                        {
                          "bg-dark": progress == 0,
                        }
                      )}
                    />
                    <span className="caption mt-3 p-0">{steps[0]?.toFixed()}%</span>
                  </div>
                  <div className="position-absolute step step-20 d-flex align-items-center flex-column">
                    <div
                      className={clsx(
                        "rounded-circle step-dots",
                        `bg-${handlerColorState()}`,
                        {
                          "bg-dark": progress < 25,
                        }
                      )}
                    />
                    <span className="caption mt-3 p-0">{steps[1]?.toFixed()}%</span>
                  </div>
                  <div className="position-absolute step step-40 d-flex align-items-center flex-column">
                    <div
                      className={clsx(
                        "rounded-circle step-dots",
                        `bg-${handlerColorState()}`,
                        {
                          "bg-dark": progress < 50,
                        }
                      )}
                    />
                    <span className="caption mt-3 p-0">{steps[2]?.toFixed()}%</span>
                  </div>
                  <div className="position-absolute step step-80 d-flex align-items-center flex-column">
                    <div
                      className={clsx(
                        "rounded-circle step-dots",
                        `bg-${handlerColorState()}`,
                        {
                          "bg-dark": progress < 75,
                        }
                      )}
                    />
                    <span className="caption mt-3 p-0">{steps[3]?.toFixed()}%</span>
                  </div>
                  <div className="position-absolute step step-100 d-flex align-items-center flex-column">
                    <div className="rounded-circle step-dots bg-transparent" />
                    <span className="caption mt-3 p-0">{">"}{steps[3]?.toFixed()}</span>
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
