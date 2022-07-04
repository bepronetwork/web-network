import React, { useEffect, useState } from "react";

export default function Stepper({ children, hack = false }) {
  const [activeStep, setActiveStep] = useState(0);
  const [viewedSteps, setViewedSteps] = useState<number[]>([0]);

  function handleClick(stepToGo: number) {
    if (stepToGo <= activeStep || children[stepToGo - 1].props.validated || hack) setActiveStep(stepToGo);
  }

  useEffect(() => {
    setViewedSteps([...new Set([...viewedSteps, activeStep])]);
  }, [activeStep]);

  return (
    <div className="row">
      <div className="col-12">
        <div className="stepper">
          {children.map((step, index) => React.cloneElement(step, { 
            key: `step-${index}`, 
            activeStep, 
            index,
            validated: step.props.validated && viewedSteps.includes(index),
            handleClick }))
          }
        </div>
      </div>
    </div>
  );
}
