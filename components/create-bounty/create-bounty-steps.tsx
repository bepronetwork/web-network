import { Fragment } from "react";

export default function CreateBountySteps({
  steps,
  currentSection,
  progressPercentage = 100,
}: {
  steps: string[];
  currentSection: number;
  progressPercentage?: number;
}) {
  function handleColorState(index: number) {
    if (index <= currentSection) {
      return "bg-primary";
    } else {
      return "bg-gray-300";
    }
  }

  function renderColumn(label: string, index: number) {
    return (
    <Fragment key={index}>
      <div className="my-4 col-3 d-flex flex-column bg-black">
        <div className="row mb-2">
          <div className="p-0 col-md-11">
            <div className="progress bg-gray-300  issue-progress-vertical">
              <div
                className={`progress-bar ${handleColorState(index)}`}
                role="progressbar"
                style={{
                  width: `${progressPercentage}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <span className="text-gray">Step {index + 1}</span>
        <span>{label}</span>
      </div>
    </Fragment>
    );
  }

  return <div className="row my-4">{steps.map(renderColumn)}</div>;
}
