import React, { useState } from "react";

export default function Stepper({ children }) {
  const [activeStep, setActiveStep] = useState(0);

  function handleClick(stepToGo: number) {
    if (stepToGo <= activeStep || children[stepToGo - 1].props.validated) setActiveStep(stepToGo);
  }

  return (
    <div className="row">
      <div className="col-12">
        <div className="stepper">
          {children.map((step, index) => React.cloneElement(step, { activeStep, index, handleClick }))}
          </div>
      </div>
    </div>
  );
}
