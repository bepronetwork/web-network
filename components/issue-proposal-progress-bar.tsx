import {Fragment, useEffect, useState} from "react";

import {add, addSeconds, compareAsc, intervalToDuration} from "date-fns";
import {useTranslation} from "next-i18next";

import {useAppState} from "contexts/app-state";

import {formatDate, getTimeDifferenceInWords} from "helpers/formatDate";

export default function IssueProposalProgressBar() {
  const {t} = useTranslation(["common", "bounty"]);

  const [stepColor, setStepColor] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>();
  const [chainTime, setChainTime] = useState<number>(+ new Date())
  const [steps, setSteps] = useState<string[]>([
    t("bounty:steps.draft"),
    t("bounty:steps.funding"),
    t("bounty:steps.development"),
    t("bounty:steps.validation"),
    t("bounty:steps.closed")
  ]);

  const {state} = useAppState();

  const getChainTime = () => state?.Service?.active?.getTimeChain().then(setChainTime).catch(console.log);

  const { isClosed, isCanceled, isDraft, isFundingRequest, isFunded } = state.currentBounty?.data || {};

  const isInValidation = !!(state.currentBounty?.data?.state === "proposal");
  const creationDate = state.currentBounty?.data?.createdAt;
  const fundedDate = state.currentBounty?.data?.fundedAt;
  const closedDate = isClosed ? state.currentBounty?.data?.updatedAt : undefined;
  const lastProposalCreationDate =
    state.currentBounty?.data?.mergeProposals?.
      filter(proposal => !proposal.refusedByBountyOwner && !proposal.isDisputed)
      .reduce((acc, curr) => +curr.contractCreationDate > +acc ? new Date(curr.contractCreationDate) : acc,
              creationDate);

  function toRepresentationHeight() {
    return currentStep === 0 ? "1px" : `${currentStep * 66.7}px`;
  }

  function heightIssueProgressHorizontal() {
    return isFundingRequest ? "270px" : "200px"
  }

  function renderSecondaryText(stepLabel, index) {
    const secondaryTextStyle = { top: "20px" };
    const isHigher = creationDate &&
                    (new Date(chainTime) > addSeconds(creationDate, +state.Service?.network?.times?.draftTime));

    const item = (date, toAdd = 0) => ({
      Warning: {
        text: t("bounty:status.until-open", {
          distance: isHigher ? '0 seconds'
            : getTimeDifferenceInWords(addSeconds(date, toAdd), new Date(chainTime))
        }),
        color: "warning",
        bgColor: "warning-opac-25"
      },
      Started: {
        text: t("bounty:status.started-time", {
          distance: getTimeDifferenceInWords(new Date(date), new Date(chainTime))
        }),
        color: "light-gray"
      },
      At: {
        text: t("bounty:status.end-time", { data: formatDate(date) }),
        color: "light-gray"
      }
    });

    let currentValue: { text: string; color?: string; bgColor?: string } = {
      text: ""
    };

    if (creationDate && index === currentStep && currentStep === 1 && !isFundingRequest)
      currentValue = item(addSeconds(creationDate, +state.Service?.network?.times?.draftTime)).Started;

    if (creationDate && index === currentStep && currentStep === 0 && !isCanceled && !isClosed)
      currentValue = item(creationDate, +state.Service?.network?.times?.draftTime).Warning;

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
        const startedFundedDate = add(creationDate, intervalFunded)
        const startedDraftDate = addSeconds(creationDate, +state.Service?.network?.times?.draftTime)

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
        <div>
          <span
            className={`text-wrap text-${
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
      currentStep >= index ? stepColor : "light-gray"
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
                className={`white-space text-uppercase caption mb-1 text-${
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

  useEffect(()=> {getChainTime()},[])
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

    if (isClosed) step = 3 + addIsFunding;
    else if (isInValidation) step = 2 + addIsFunding;
    else if (!isDraft && (!isFundingRequest || isFunded)) step = 1 + addIsFunding;

    if (isCanceled) stepColor = "danger";
    if (isClosed) stepColor = "success";

    setStepColor(stepColor);
    setCurrentStep(step);
  }, [isClosed, isDraft, isCanceled, isInValidation, isFundingRequest, isFunded]);

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
                <div className="progress bg-light-gray issue-progress-horizontal" style={{
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
