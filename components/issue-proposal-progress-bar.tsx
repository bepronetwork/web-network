import { Fragment, useEffect, useState } from "react";

import { add, addSeconds, compareAsc, intervalToDuration } from "date-fns";
import { useTranslation } from "next-i18next";

import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";

import { formatDate, getTimeDifferenceInWords } from "helpers/formatDate";

export default function IssueProposalProgressBar() {
  const { t } = useTranslation(["common", "bounty"]);

  const [stepColor, setStepColor] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>();
  const [draftTime, setDraftTime] = useState(0);
  const [steps, setSteps] = useState<string[]>([
    t("bounty:steps.draft"),
    t("bounty:steps.funding"),
    t("bounty:steps.development"),
    t("bounty:steps.validation"),
    t("bounty:steps.closed")
  ])  
  const { activeNetwork } = useNetwork();
  const { activeIssue, networkIssue } = useIssue();

  const isFinalized = !!networkIssue?.closed;
  const isInValidation = !!networkIssue?.isInValidation;
  const isIssueinDraft = !!networkIssue?.isDraft;
  const isFundingRequest = networkIssue?.fundingAmount?.gt(0) || activeIssue?.fundingAmount?.gt(0);
  const isBountyFunded = activeIssue?.fundedAmount?.isEqualTo(activeIssue?.fundingAmount);
  const creationDate = networkIssue?.creationDate;
  const fundedDate = activeIssue?.fundedAt;
  const closedDate = networkIssue?.closedDate;
  const isCanceled = activeIssue?.state === "canceled" || !!networkIssue?.canceled;
  const lastProposalCreationDate = 
    networkIssue?.proposals?.filter(proposal => !proposal.refusedByBountyOwner && !proposal.isDisputed)
      .reduce((proposalAnt, proposalCur) => 
        proposalAnt.creationDate > proposalCur.creationDate && 
        proposalAnt || proposalCur, { creationDate })?.creationDate;

  function toRepresentationHeight() {
    return currentStep === 0 ? "1px" : `${currentStep * 66.7}px`;
  }

  function heightIssueProgressHorizontal() {
    return isFundingRequest ? "270px" : "200px"
  }

  function renderSecondaryText(stepLabel, index) {
    const secondaryTextStyle = { top: "20px" };

    const isHigher = creationDate && (new Date() > addSeconds(creationDate, draftTime));

    const item = (date, toAdd = 0) => ({
      Warning: {
        text: t("bounty:status.until-done", {
          distance: isHigher ? '0 seconds' 
            : getTimeDifferenceInWords(addSeconds(date, toAdd), new Date())
        }),
        color: "warning",
        bgColor: "warning-opac-25"
      },
      Started: {
        text: t("bounty:status.started-time", {
          distance: getTimeDifferenceInWords(new Date(date), new Date())
        }),
        color: "ligth-gray"
      },
      At: {
        text: t("bounty:status.end-time", { data: formatDate(date) }),
        color: "ligth-gray"
      }
    });

    let currentValue: { text: string; color?: string; bgColor?: string } = {
      text: ""
    };

    if (creationDate && index === currentStep && currentStep === 1 && !isFundingRequest) 
      currentValue = item(addSeconds(creationDate, draftTime)).Started;

    if (creationDate && index === currentStep && currentStep === 0 && !isCanceled && !isFinalized) 
      currentValue = item(creationDate, draftTime).Warning;
    
    if (
        index === currentStep &&
        currentStep === 2 &&
        !isCanceled &&
        !isFinalized
      ) {
      if (isFundingRequest && creationDate && fundedDate) {
        const intervalFunded = intervalToDuration({
            start: creationDate,
            end: new Date(fundedDate),
        });
        const startedFundedDate = add(creationDate, intervalFunded)
        const startedDraftDate = addSeconds(creationDate, draftTime)

        if(compareAsc(startedDraftDate, startedFundedDate) === 1){
          currentValue = item(startedDraftDate).Started
        }else {
          currentValue = item(startedFundedDate).Started;
        }
      } else if(lastProposalCreationDate) {
        currentValue = item(lastProposalCreationDate).Started;
      }
    }

    if (closedDate && index === currentStep && currentStep === 3) 
      currentValue = isFundingRequest ? item(lastProposalCreationDate).Started : item(closedDate).At;
    
    if (closedDate && index === currentStep && currentStep === 4) item(closedDate).At;

    if (currentValue)
      return (
        <div className="position-absolute" style={secondaryTextStyle}>
          <span
            className={`text-${
              currentValue.color && currentValue.color
            } text-uppercase caption-small `}
          >
            {currentValue.text}
          </span>
        </div>
      );
  }

  function renderColumn(stepLabel, index) {
    const style = { top: index === 0 ? "0" : `${index * 66.7}px`, left: "7px" };
    const dotClass = `d-flex align-items-center justify-content-center rounded-circle bg-${
      currentStep >= index ? stepColor : "ligth-gray"
    }`;
    const dotStyle = { width: "12px", height: "12px" };
    const labelStyle = { left: "40px" };
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
            <div
              className="position-absolute d-flex align-items-start flex-column mt-1"
              style={labelStyle}
            >
              <label
                className={`text-uppercase caption mb-1 text-${
                  isCanceled ? "danger" : `${currentItem ? stepColor : "gray"}`
                }`}
              >
                {stepLabel}
              </label>
              {currentItem && renderSecondaryText(stepLabel, index)}
            </div>
          </div>
        </div>
      </Fragment>
    );
  }

  useEffect(() => {
    if (activeNetwork?.draftTime) setDraftTime(activeNetwork?.draftTime);
  }, [activeNetwork?.draftTime, activeNetwork?.disputableTime]);

  useEffect(() => {
    const isFundingStep = !!steps.find(name => name === t("bounty:steps.funding"))

    if (isFundingRequest && !isFundingStep) setSteps(currentState => {
      currentState.splice(1,0,t("bounty:steps.funding"))
      return currentState
    })
    
    if (!isFundingRequest && isFundingStep) setSteps((currentState) => {
      return currentState.filter(state => state !== t("bounty:steps.funding"))
    })

  }, [isFundingRequest]);

  useEffect(() => {
    //Draft -> isIssueInDraft()
    //Development -> estado inicial
    //Finalized -> recognizedAsFinished == true
    //Dispute Window -> mergeProposalAmount > 0
    //Closed and Distributed -> finalized == true
    const addIsFunding = isFundingRequest ? 1 : 0
    
    let step = 0 + addIsFunding;
    let stepColor = "primary"

    if (isFinalized) step = 3 + addIsFunding;
    else if (isInValidation) step = 2 + addIsFunding;
    else if (!isIssueinDraft) step = 1 + addIsFunding;

    if (isCanceled) stepColor = "danger";
    if (isFinalized) stepColor = "success";

    setStepColor(stepColor);
    setCurrentStep(step);
  }, [isFinalized, isIssueinDraft, isCanceled, isInValidation, isFundingRequest, isBountyFunded]);

  return (
    <div className="container">
      <div className="row">
        <div className="ps-0 col-md-12">
          <div className="content-wrapper mb-4 pb-0 pt-0 issue-proposal-progress">
            <div className="d-flex justify-content-start mb-3 pt-4">
              <span className="caption-large">{t("bounty:steps.title")}</span>
            </div>
            <div className="row">
              <div className="position-relative">
                <div className="progress bg-ligth-gray issue-progress-horizontal" style={{
                  height: `${heightIssueProgressHorizontal()}`
                }}>
                  <div
                    className={`progress-bar w-100 bg-${stepColor}`}
                    role="progressbar"
                    style={{
                      height: `${toRepresentationHeight()}`
                    }}
                  >
                    {steps.map(renderColumn)}
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
