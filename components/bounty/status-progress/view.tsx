import { Fragment } from "react";

import { add, addSeconds, compareAsc, intervalToDuration } from "date-fns";
import { useTranslation } from "next-i18next";

import ResponsiveWrapper from "components/responsive-wrapper";

import { formatDate, getTimeDifferenceInWords } from "helpers/formatDate";

interface BountyStatusProgressProps {
  steps: string[];
  creationDate: Date;
  chainTime: number;
  toRepresentationHeight: () => string;
  heightIssueProgressHorizontal: () => "270px" | "200px";
  draftTime: string | number;
  currentStep: number;
  isFundingRequest: boolean;
  isCanceled: boolean;
  isClosed: boolean;
  fundedDate: Date;
  lastProposalCreationDate: Date;
  closedDate: Date;
  stepColor: string;
}

export default function BountyStatusProgressView({
  steps,
  creationDate,
  chainTime,
  toRepresentationHeight,
  heightIssueProgressHorizontal,
  draftTime,
  currentStep,
  isFundingRequest,
  isCanceled,
  isClosed,
  fundedDate,
  lastProposalCreationDate,
  closedDate,
  stepColor,
}: BountyStatusProgressProps) {
  const { t } = useTranslation(["common", "bounty"]);

  function renderSecondaryText(index) {
    const isHigher =
      creationDate &&
      new Date(chainTime) > addSeconds(creationDate, +draftTime);

    const item = (date, toAdd = 0) => ({
      Warning: {
        text: t("bounty:status.until-open", {
          distance: isHigher
            ? "0 seconds"
            : getTimeDifferenceInWords(addSeconds(date, toAdd),
                                       new Date(chainTime)),
        }),
        color: "warning",
        bgColor: "warning-opac-25",
      },
      Started: {
        text: t("bounty:status.started-time", {
          distance: getTimeDifferenceInWords(new Date(date),
                                             new Date(chainTime)),
        }),
        color: "light-gray",
      },
      At: {
        text: t("bounty:status.end-time", { data: formatDate(date) }),
        color: "light-gray",
      },
    });

    let currentValue: { text: string; color?: string; bgColor?: string } = {
      text: "",
    };

    if (
      creationDate &&
      index === currentStep &&
      currentStep === 1 &&
      !isFundingRequest
    )
      currentValue = item(addSeconds(creationDate, +draftTime)).Started;

    if (
      creationDate &&
      index === currentStep &&
      currentStep === 0 &&
      !isCanceled &&
      !isClosed
    )
      currentValue = item(creationDate, +draftTime).Warning;

    if (
      index === currentStep &&
      currentStep === 2 &&
      !isCanceled &&
      !isClosed
    ) {
      if (isFundingRequest && creationDate && fundedDate) {
        const intervalFunded = intervalToDuration({
          start: creationDate,
          end: new Date(fundedDate),
        });
        const startedFundedDate = add(creationDate, intervalFunded);
        const startedDraftDate = addSeconds(creationDate, +draftTime);

        if (compareAsc(startedDraftDate, startedFundedDate) === 1) {
          currentValue = item(startedDraftDate).Started;
        } else {
          currentValue = item(startedFundedDate).Started;
        }
      } else if (lastProposalCreationDate) {
        currentValue = item(lastProposalCreationDate).Started;
      }
    }

    if (closedDate && index === currentStep && currentStep === 3)
      currentValue = isFundingRequest
        ? item(lastProposalCreationDate).Started
        : item(closedDate).At;

    if (closedDate && index === currentStep && currentStep === 4)
      item(closedDate).At;

    if (currentValue)
      return (
        <ResponsiveWrapper xs={false} lg={true}>
          <span
            className={`white-space text-${
              currentValue.color && currentValue.color
            } text-uppercase caption-small secondary-text `}
          >
            {currentValue.text}
          </span>
        </ResponsiveWrapper>
      );
  }

  function renderColumn(stepLabel, index) {
    const style = { top: index === 0 ? "0" : `${index * 66.7}px`, left: "7px" };
    const dotClass = `d-flex align-items-center justify-content-center rounded-circle bg-${
      currentStep >= index ? stepColor : "light-gray"
    }`;
    const dotStyle = { width: "12px", height: "12px" };
    const labelStyle = { left: "25px" };
    const currentItem = currentStep === index;
    const isLastItem = currentStep === steps.length - 1;

    return (
      <Fragment key={index}>
        <div
          className="position-absolute d-flex align-items-center flex-column"
          style={style}
        >
          <div className={dotClass} style={dotStyle}>
            <div
              className={`rounded-circle bg-${
                currentItem && !isCanceled && !isLastItem && "white"
              }`}
              style={{ width: "6px", height: "6px" }}
            ></div>
          </div>
          <div
            className="position-absolute d-flex align-items-start flex-column w-100"
            style={labelStyle}
          >
            <label
              className={`white-space text-uppercase caption text-${
                isCanceled ? "danger" : `${currentItem ? stepColor : "gray"}`
              }`}
            >
              {stepLabel}
            </label>
            {currentItem && renderSecondaryText(index)}
          </div>
        </div>
      </Fragment>
    );
  }

  return (
    <div className="sticky-bounty">
      <div className="row justify-content-center">
        <div className="col-12">
          <div
            className={`content-wrapper bg-gray-850 mb-4 ${
              isFundingRequest ? "pb-5" : "pb-0"
            } pt-0 issue-proposal-progress`}
          >
            <div className="d-flex justify-content-start mb-3 pt-4">
              <span className="caption-medium">{t("bounty:steps.title")}</span>
            </div>
            <div className="row">
              <div className="position-relative">
                <div
                  className="progress bg-light-gray issue-progress-horizontal"
                  style={{
                    height: `${heightIssueProgressHorizontal()}`,
                  }}
                >
                  <div
                    className={`progress-bar w-100 bg-${stepColor}`}
                    role="progressbar"
                    style={{
                      height: `${toRepresentationHeight()}`,
                    }}
                  ></div>
                </div>

                {steps.map(renderColumn)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
