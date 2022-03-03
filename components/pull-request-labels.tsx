import React from 'react';

export type PRLabel = 'ready to merge' | 'broken tests' | 'conflicts' | 'merged' | 'closed';
interface IPRLabel{
  label: PRLabel;
  className?: string;
  hero?: boolean;
}

function PullRequestLabels({label, className, hero = false }: IPRLabel) {
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
      case 'closed': {
        return "danger";
      }
      default: {
        return hero ? 'white' : 'primary';
      }
    }
  }

  return(
    <div className={`pullrequest-labels d-flex justify-content-center align-items-center bg-${getColorLabel()}-30 rounded-pill p-1 ${className || ''}`}>
      <span className={`caption-small text-uppercase text-${getColorLabel()} mx-1 text-nowrap`}>{label}</span>
    </div>
  )
}

export default PullRequestLabels;