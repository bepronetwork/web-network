import { Fragment } from "react";

import { useTranslation } from "next-i18next";

import ResponsiveWrapper from "components/responsive-wrapper";

export default function CreateBountySteps({
  steps,
  currentSection,
  updateCurrentSection,
  progressPercentage = 100,
}: {
  steps: string[];
  currentSection: number;
  progressPercentage?: number;
  updateCurrentSection?: (b: number) => void;
}) {
  const { t } = useTranslation(["bounty"]);

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
        <div
          className="my-4 col-3 d-flex flex-column cursor-pointer"
          onClick={() => updateCurrentSection(index)}
        >
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
        <ResponsiveWrapper  className="d-flex flex-column" xs={false} md={true}>
          <span className="text-gray">{t("bounty:step", {currentStep: (index + 1)})}</span>
          <span>{label}</span>
        </ResponsiveWrapper>
      </div>
    </Fragment>
    );
  }

  return (
    <>
      <ResponsiveWrapper className="row mb-4 mt-1 mx-2" xs={true} md={false}>
        {steps.map(renderColumn)}
      </ResponsiveWrapper>
      <ResponsiveWrapper className="row my-4 mx-1" xs={false} md={true}>
        {steps.map(renderColumn)}
      </ResponsiveWrapper>
    </>
  );
}
