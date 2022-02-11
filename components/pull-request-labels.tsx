import React from 'react';

export type PRLabel = 'ready to merge' | 'broken tests' | 'conflicts' | 'merged';
interface IPRLabel{
  label: PRLabel;
  className?: string;
}

function PullRequestLabels({label, className }: IPRLabel) {
  if(!label) return <></>
  
  function getColorLabel() {
    switch (label?.toLowerCase()) {
      case 'ready to merge': {
        return "success";
      }
      case 'broken tests': {
        return "warning";
      }
      case 'conflicts': {
        return "danger";
      }
      default: {
        return "primary";
      }
    }
  }

  return(
    <div className={`pullrequest-labels bg-${getColorLabel()}-30 rounded-pill p-1 ${className || ''}`}>
      <span className={`caption-small text-uppercase text-${getColorLabel()} mx-1 text-nowrap`}>{label}</span>
    </div>
  )
}

export default PullRequestLabels;