import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import { useAppState } from "contexts/app-state";

import { IssueBigNumberData } from "interfaces/issue-data";

import BountyStatusProgressView from "./view";

export default function BountyStatusProgress({ currentBounty }: { currentBounty: IssueBigNumberData}) {
  const { t } = useTranslation(["common", "bounty"]);

  const [stepColor, setStepColor] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<number>();
  const [chainTime, setChainTime] = useState<number>(+new Date());
  const [steps, setSteps] = useState<string[]>([
    t("bounty:steps.draft"),
    t("bounty:steps.funding"),
    t("bounty:steps.development"),
    t("bounty:steps.validation"),
    t("bounty:steps.closed"),
  ]);

  const { state } = useAppState();

  const getChainTime = () =>
    state?.Service?.active
      ?.getTimeChain()
      .then(setChainTime)
      .catch(console.log);

  const { isClosed, isCanceled, isDraft, isFundingRequest, isFunded } =
    currentBounty || {};

  const isInValidation = !!(currentBounty?.state === "proposal");
  const creationDate = currentBounty?.createdAt;
  const fundedDate = currentBounty?.fundedAt;
  const closedDate = isClosed
    ? currentBounty?.updatedAt
    : undefined;
  const lastProposalCreationDate = currentBounty?.mergeProposals
    ?.filter((proposal) => !proposal.refusedByBountyOwner && !proposal.isDisputed)
    .reduce((acc, curr) =>
        +curr.contractCreationDate > +acc
          ? new Date(curr.contractCreationDate)
          : acc,
            creationDate);

  function toRepresentationHeight() {
    return currentStep === 0 ? "1px" : `${currentStep * 66.7}px`;
  }

  function heightIssueProgressHorizontal() {
    return isFundingRequest ? "270px" : "200px";
  }

  useEffect(() => {
    getChainTime();
  }, []);
  useEffect(() => {
    const isFundingStep = !!steps.find((name) => name === t("bounty:steps.funding"));

    if (isFundingRequest && !isFundingStep)
      setSteps((currentState) => {
        currentState.splice(1, 0, t("bounty:steps.funding"));
        return currentState;
      });

    if (!isFundingRequest && isFundingStep)
      setSteps((currentState) => {
        return currentState.filter((state) => state !== t("bounty:steps.funding"));
      });
  }, [isFundingRequest]);

  useEffect(() => {
    //Draft -> isIssueInDraft()
    //Development -> estado inicial
    //Finalized -> recognizedAsFinished == true
    //Dispute Window -> mergeProposalAmount > 0
    //Closed and Distributed -> finalized == true
    const addIsFunding = isFundingRequest ? 1 : 0;

    let step = 0 + addIsFunding;
    let stepColor = "primary";

    if (isClosed) step = 3 + addIsFunding;
    else if (isInValidation) step = 2 + addIsFunding;
    else if (!isDraft && (!isFundingRequest || isFunded))
      step = 1 + addIsFunding;

    if (isCanceled) stepColor = "danger";
    if (isClosed) stepColor = "success";

    setStepColor(stepColor);
    setCurrentStep(step);
  }, [
    isClosed,
    isDraft,
    isCanceled,
    isInValidation,
    isFundingRequest,
    isFunded,
  ]);

  return (
    <BountyStatusProgressView
      steps={steps}
      stepColor={stepColor}
      toRepresentationHeight={toRepresentationHeight}
      heightIssueProgressHorizontal={heightIssueProgressHorizontal}
      creationDate={creationDate}
      fundedDate={fundedDate}
      closedDate={closedDate}
      lastProposalCreationDate={lastProposalCreationDate}
      isFundingRequest={isFundingRequest}
      isCanceled={isCanceled}
      isClosed={isClosed}
      chainTime={chainTime}
      draftTime={state.Service?.network?.times?.draftTime}
      currentStep={currentStep}
    />
  );
}
