import { Fragment, useEffect, useState } from 'react';

import { formatDate, getTimeDifferenceInWords } from '@helpers/formatDate';
import { addSeconds } from 'date-fns';
import { BeproService } from '@services/bepro-service';
import { useTranslation } from 'next-i18next';

export default function IssueProposalProgressBar({
  isFinalized = false,
  isIssueinDraft = true,
  mergeProposalAmount = 0,
  isFinished = false,
  isCanceled = false,
  creationDate
}) {
  const [stepColor, setStepColor] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>();
  const [redeemTime, setRedeemTime] = useState(0);
  const { t } = useTranslation(['common', 'bounty'])
  const steps = [t('bounty:steps.draft'), t('bounty:steps.development'), t('bounty:steps.finalized'), t('bounty:steps.validation'), t('bounty:steps.closed')]

  function toRepresentationPercent() {
    return currentStep === 0 ? `1` : `${currentStep * 25}`
  }

  function getStepColor() {
    if (isCanceled)
      return `danger`;
    if(isFinalized)
      return `success`;

    return `primary`;
  }

  function loadDisputeState() { 
    //Draft -> isIssueInDraft()
    //Development -> estado inicial
    //Finalized -> recognizedAsFinished == true
    //Dispute Window -> mergeProposalAmount > 0
    //Closed and Distributed -> finalized == true
    let value = 0
    if (!isIssueinDraft) {
      value = 1
      if (isFinished) {
        value = 2
        if (mergeProposalAmount > 0)
          value = 3;
        if(isFinalized){
          value = 4;
        }
      }
    }
    setCurrentStep(value)
    setStepColor(getStepColor());
  }


  function renderSecondaryText(stepLabel, index) {
    const secondaryTextStyle = { top: "20px" };

    let item = {
      Warning: {
        text: t("bounty:status.until-done", {
          distance: getTimeDifferenceInWords(
            addSeconds(creationDate, redeemTime),
            new Date()
          ),
        }),
        color: "warning",
        bgColor: "warning-opac-25",
      },
      Started: {
        text: t("bounty:status.started-time", {
          distance: getTimeDifferenceInWords(creationDate, new Date()),
        }),
        color: "ligth-gray",
      },
      At: {
        text: t("bounty:status.end-time", { data: formatDate(creationDate) }),
        color: "ligth-gray",
      },
    };

    let currentValue: { text: string; color?: string; bgColor?: string } = {
      text: "",
    };

    if (
      index === currentStep &&
      [steps[1], steps[3]].includes(steps[currentStep])
    ) {
      currentValue = item.Started;
    }

    if (index === currentStep && isIssueinDraft && !isCanceled) {
      currentValue = item.Warning;
    }

    if (
      index === currentStep &&
      [steps[2], steps[4]].includes(steps[currentStep])
    ) {
      currentValue = item.At;
    }

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
    const style = { top: index === 0 ? "0" : `${index * 60}px`, left: "7px"}
    const dotClass = `d-flex align-items-center justify-content-center rounded-circle bg-${currentStep >= index ? stepColor : `ligth-gray`}`;
    const dotStyle = { width: `12px`, height: `12px` }
    const labelStyle = { left: "40px" }
    const currentItem = currentStep === index
    const isLastItem = currentStep === steps.length - 1;

    return <Fragment key={index}>
      <div className='position-absolute d-flex align-items-center flex-column' style={style}>
         <div className={dotClass} style={dotStyle}>
         <div className={`rounded-circle bg-${currentItem && !isCanceled && !isLastItem && 'white'}`} style={{ width: `6px`, height: `6px` }} ></div>
            <div className='position-absolute d-flex align-items-start flex-column mt-1' style={labelStyle}>
              <label className={`text-uppercase caption mb-1 text-${isCanceled ? `danger`: `${currentItem ? stepColor : 'gray'}`}`}>{stepLabel}</label>
              {currentItem && renderSecondaryText(stepLabel, index)}
            </div>
        </div>
     </div>
    </Fragment>
  }

  useEffect(loadDisputeState, [isFinalized, isIssueinDraft, isCanceled, mergeProposalAmount, isFinished]);
  useEffect(() => {
    BeproService.getRedeemTime()
      .then(time => setRedeemTime(time))
      .catch(error => console.log('Failed to get redeem time:', error))
  }, [])

  return (
    <div className="container">
      <div className="row">
        <div className="ps-0 col-md-12">
          <div className="content-wrapper mb-4 pb-0 pt-0 issue-proposal-progress">
            <div className="d-flex justify-content-start mb-3 pt-4">
              <span className="caption-large">{t('bounty:steps.title')}</span>
            </div>
            <div className="row">
              <div className="position-relative">
                <div className="progress bg-ligth-gray issue-progress-horizontal">
                  <div
                    className={`progress-bar w-100 bg-${stepColor}`}
                    role="progressbar"
                    style={{
                      height: `${toRepresentationPercent()}%`,
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
