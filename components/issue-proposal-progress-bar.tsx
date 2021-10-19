import { useEffect, useState } from 'react';

export enum StatusIds {
  Completed = 'Completed',
  Canceled = 'Canceled',
  UntilDone = '3 days until done',
  Distribution = 'Distribution',
  Pending = 'Pending'
}
export default function IssueProposalProgressBar({
  isFinalized = false,
  isIssueinDraft = true,
  mergeProposalsAmount = 0,
  isFinished = false,
  isCanceled = false,
}) {
  const [stepColor, setStepColor] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>();
  const steps = ['Draft', 'Development', 'Finalized', 'Validation & Disputes', 'Closed and Distributed']

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
          value = 4;
        if(isFinalized){
          value = 5;
        }
      }
    }
    setCurrentStep(value)
    setStepColor(getStepColor());
  }

  function renderStepStatus(stepLabel, index) {
    let item = {
      Completed: {
        text: StatusIds.Completed,
        color: 'primary',
        bgColor: 'primary',
      },
      Canceled: {
        text: StatusIds.Canceled,
        color: 'danger',
        bgColor: 'danger',
      },
      Warning: {
        text: StatusIds.UntilDone,
        color: 'warning',
        bgColor: 'warning',
      },
      Pending: {
        text: StatusIds.Pending,
        color: 'gray',
        bgColor: 'dark-gray',
      }
    }

    let currentValue = item.Pending;

    if (index < currentStep) {
      currentValue = item.Completed;
    }

    if (index === currentStep && isIssueinDraft) {
      currentValue = item.Warning;
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
    const style = { left: index === 0 ? `1%` : `${index * 24}%` };
    const dotStyle = { width: `20px`, height: `20px` };

    return <>
      <div className="position-absolute d-flex align-items-center flex-column" style={style}>
        <div className={dotClass} style={dotStyle}>
          <div className='position-relative d-flex align-items-start flex-column'>
            <div className={`rounded-circle bg-${currentItem && !isCanceled && !isLastItem && 'white'}`} style={{ width: `10px`, height: `10px` }} ></div>
            <div className='position-absolute mt-4 d-flex align-items-start flex-column'>
              <label className={`text-uppercase mediumCaption mb-1 text-${currentItem ? stepColor : 'gray'}`}>{stepLabel}</label>
              {renderStepStatus(stepLabel, index)}
            </div>
          </div>
        </div>
      </div>
    </>
  }

  useEffect(loadDisputeState, [isFinalized, isIssueinDraft, isCanceled, mergeProposalsAmount, isFinished]);

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className=' col-md-10'>
          <div className="content-wrapper mb-4 pb-0">
            <div className="issue-proposal-progress col-9">
              <div className="row">
                <div className="ms-2 col-12 position-relative">
                  <div className="progress bg-dark" style={{ height: '6px' }}>
                    <div className={`progress-bar bg-${stepColor}`} role="progressbar" style={{ width: `${toRepresentationPercent()}%` }}>
                      {steps.map(renderColumn)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
