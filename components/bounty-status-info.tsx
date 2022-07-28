import React from "react";

import { IssueState } from "interfaces/issue-data";

import Translation from "./translation";

interface IBountyStatusInfo {
  issueState: IssueState;
}
export default function BountyStatusInfo({ issueState }: IBountyStatusInfo) {
  function handleColorState(ellipse = false) {
    switch (issueState?.toLowerCase()) {
    case "draft": {
      if(ellipse) return "bg-info"
      return "bg-info-30 text-info";
    }
    case "open": {
      if(ellipse) return "bg-primary"
      return "bg-primary-30 text-white";
    }
    case "canceled": {
      if(ellipse) return null
      return "bg-danger-30 text-danger-70";
    }
    case "closed": {
      if(ellipse) return null
      return "bg-dark-gray text-white-40";
    }
    case "ready": {
      if(ellipse) return "bg-success"
      return "bg-success-30 text-success";
    }
    case "proposal": {
      if(ellipse) return "bg-purple"
      return "bg-purple-30 text-purple";
    }
    case "funding": {
      if(ellipse) return "bg-light-warning"
      return "bg-light-warning-30 text-light-warning";
    }
    default: {
      if(ellipse) return "bg-primary"
      return "bg-primary-30 text-white";
    }
    }
  }

  function renderEllipse(issueState: IssueState) {
    if(["canceled", "closed"].includes(issueState)) return null
    return <div className={`ellipse bg-primary me-2 ${handleColorState(true)}`} />
  }

  return (
    <span className={`d-flex status caption-medium py-1 px-3 ${handleColorState()}`}>
      {renderEllipse(issueState)}
      {issueState && <Translation ns="bounty" label={`status.${issueState}`} />}
    </span>
  );
}
