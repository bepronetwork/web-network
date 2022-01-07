import { Fragment, useEffect, useState } from 'react';

import { getTimeDifferenceInWords } from '@helpers/formatDate';
import { addSeconds } from 'date-fns';
import { BeproService } from '@services/bepro-service';
import { useTranslation } from 'next-i18next';

export default function IssueProposalProgressBar({
  isFinalized = false,
  isIssueinDraft = true,
  mergeProposalsAmount = 0,
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
      return `danger`

    return `primary`;
  }

  function loadDisputeState() {
    //Draft -> isIssueInDraft()
    //Development -> estado inicial
    //Finalized -> recognizedAsFinished == true
    //Dispute Window -> mergeProposalsAmount > 0
    //Closed and Distributed -> finalized == true
    let value = 0
    if (!isIssueinDraft) {
      value = 1
      if (isFinished) {
        value = 2
        if (mergeProposalsAmount > 0)
          value = 3;
        if(isFinalized){
          value = 4;
        }
      }
    }
    setCurrentStep(value)
    setStepColor(getStepColor());
  }

  function renderStepStatus(stepLabel, index) {
    let item = {
      Completed: {
        text: t('bounty:status.completed'),
        color: 'primary',
        bgColor: 'primary',
      },
      Canceled: {
        text: t('bounty:status.canceled'),
        color: 'danger',
        bgColor: 'danger-opac-25',
      },
      Warning: {
        text: t('bounty:status.until-done', {distance: getTimeDifferenceInWords(addSeconds(creationDate, redeemTime), new Date())}),
        color: 'warning',
        bgColor: 'warning-opac-25',
      },
      Pending: {
        text: t('bounty:status.pending'),
        color: 'gray',
        bgColor: 'dark-gray',
      },
      InProgress: {
        text: t('bounty:status.in-progress'),
        color: 'white',
        bgColor: 'primary',
      }
    }

    let currentValue = item.Pending;

    if (index === currentStep) {
      currentValue = item.InProgress;
    }

    if (index === currentStep && isIssueinDraft) {
      currentValue = item.Warning;
    }

    if (index < currentStep || currentStep === steps.length - 1) {
      currentValue = item.Completed;
    }

    if (isCanceled) {
      currentValue = item.Canceled;
    }

    return (
      <div className={`bg-${currentValue.bgColor} bg-opacity-25 py-1 px-2  rounded-pill mt-2`}>
        <span className={`text-${currentValue.color} bg-opacity-100 text-uppercase`}>{currentValue.text}</span>
      </div>
    )
  }

  function renderColumn(stepLabel, index) {
    const currentItem = currentStep === index
    const isLastItem = currentStep === steps.length - 1;
    const dotClass = `d-flex align-items-center justify-content-center rounded-circle bg-${currentStep >= index ? stepColor : `dark`}`;
    const style = { left: index === 0 ? `1%` : `${(index * 24)+1}%` };
    const dotStyle = { width: `20px`, height: `20px` };

    return <Fragment key={index}>
      <div className="position-absolute d-flex align-items-center flex-column" style={style}>
        <div className={dotClass} style={dotStyle}>
          <div className='position-relative d-flex align-items-start flex-column'>
            <div className={`rounded-circle bg-${currentItem && !isCanceled && !isLastItem && 'white'}`} style={{ width: `10px`, height: `10px` }} ></div>
            <div className='position-absolute mt-4 d-flex align-items-start flex-column'>
              <label className={`text-uppercase caption mb-1 text-${currentItem ? stepColor : 'gray'}`}>{stepLabel}</label>
              {renderStepStatus(stepLabel, index)}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  }
  
  function renderColumnT(stepLabel, index) {

    const style = { top: index === 0 ? "0" : `${index * 60}px`, left: "7.5px"}
    const dotClass = `d-flex align-items-center justify-content-center rounded-circle bg-${currentStep >= index ? stepColor : `dark`}`;
    const dotStyle = { width: `12px`, height: `12px` }
    const labelStyle = { left: "40px" }
    const secondaryText = { top: '20px' }
    const currentItem = currentStep === index
    const isLastItem = currentStep === steps.length - 1;

    return <Fragment key={index}>
      <div className='position-absolute d-flex align-items-center flex-column' style={style}>
         <div className={dotClass} style={dotStyle}>
         <div className={`rounded-circle bg-${currentItem && !isCanceled && !isLastItem && 'white'}`} style={{ width: `6px`, height: `6px` }} ></div>
            <div className='position-absolute d-flex align-items-start flex-column mt-1' style={labelStyle}>
              <label className={`text-uppercase caption mb-1 text-${currentItem ? stepColor : 'gray'}`}>{stepLabel}</label>
              {currentItem && 
                             <div className='position-absolute' style={secondaryText}>
                             <span className={`text-warning bg-opacity-100 text-uppercase`}>3 Days Until Done</span>
                          </div>
                          }

            </div>
        </div>
     </div>
    </Fragment>
  }

  useEffect(loadDisputeState, [isFinalized, isIssueinDraft, isCanceled, mergeProposalsAmount, isFinished]);
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
                <div className="progress bg-dark issue-progress-horizontal">
                  <div
                    className={`progress-bar w-100 bg-${stepColor}`}
                    role="progressbar"
                    style={{
                      height: `${toRepresentationPercent()}%`,
                    }}
                  >
                    {steps.map(renderColumnT)}
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
