import React, { useEffect, useState } from "react";

export default function Stepper({ disableActiveStep = false, dark = false, children }) {
  const [activeStep, setActiveStep] = useState(disableActiveStep ? -1 : 0);
  const [viewedSteps, setViewedSteps] = useState<number[]>([0]);
  const [validatedSteps, setValidatedSteps] = useState<boolean[]>([])

  function handleClick(stepToGo: number) {
    const isEveryBeforeValidated = validatedSteps.slice(0, stepToGo).every(t=>t);

    if (stepToGo <= activeStep || isEveryBeforeValidated) setActiveStep(stepToGo);
  }

  useEffect(() => {
    if(disableActiveStep && activeStep !== -1)
      setActiveStep(-1)
  }, [disableActiveStep])

  useEffect(() => {
    setViewedSteps([...new Set([...viewedSteps, activeStep])]);
  }, [activeStep]);

  useEffect(()=> setValidatedSteps(children.map((step)=> step.props.validated)),[children])

  return (
    <div className="row">
      <div className="col-12">
        <div className={`stepper ${dark && "stepper-dark" || ""}`}>
          {children.map((step, index) =>
           React.cloneElement(step, { 
                key: `step-${index}`, 
                activeStep, 
                index,
                validated: step.props.validated 
                            && viewedSteps.includes(index) 
                            && validatedSteps.slice(0, index).every(t=>t),
                handleClick 
           }))
          }
        </div>
      </div>
    </div>
  );
}
