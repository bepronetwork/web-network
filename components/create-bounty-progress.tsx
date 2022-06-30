import { Fragment } from "react";

import DoneIcon from "assets/icons/done-icon";

export default function CreateBountyProgress({
  steps,
  currentSection,
  progressPercentage,
}: {
    steps: string[],
    currentSection: number,
    progressPercentage: number
}) {
  function handleStyleColumns(column: number) {
    if (column === 0) {
      return "50px";
    } else if (column === 1) {
      return "166px";
    } else {
      return `${column * 144}px`;
    }
  }

  function handleColorState(index: number) {
    if (index === currentSection) {
      return "text-white";
    } else if (index < currentSection) {
      return "text-primary";
    } else {
      return "color-light-gray";
    }
  }

  function renderColumn(stepLabel: string, index: number) {
    const style = { left: handleStyleColumns(index) };
    const dotClass = `d-flex align-items-center justify-content-center rounded-circle bg-light-gray`;
    const dotStyle = { width: "18px", height: "18px" };
    const labelStyle = { top: "20px" };

    return (
      <Fragment key={index}>
        <div
          className="position-absolute d-flex align-items-center flex-column"
          style={style}
        >
          <div className={dotClass} style={dotStyle}>
            <div
              className={`rounded-circle bg-${
                index <= currentSection ? "primary" : "black"
              }`}
              style={{ width: "18px", height: "18px" }}
            >
              {index < currentSection ? (
                <DoneIcon />
              ) : (
                <span className={handleColorState(index)}>{index + 1}</span>
              )}
            </div>
          </div>
          <div
            className="position-absolute d-flex align-items-start flex-column mt-1"
            style={labelStyle}
          >
            <label
              className={`text-uppercase caption-small ${handleColorState(index)}`}
            >
              {stepLabel}
            </label>
          </div>
        </div>
      </Fragment>
    );
  }

  return (
    <div className="container mb-4 pb-4">
      <div className="row justify-content-md-center">
        <div className="p-0 col-md-10">
          <div className="progress bg-black issue-progress-vertical">
            <div
              className={`progress-bar bg-primary`}
              role="progressbar"
              style={{
                width: `${progressPercentage}%`,
              }}
            >
              {steps.map(renderColumn)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
