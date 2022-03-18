import React from "react";

import { IssueState } from "interfaces/issue-data";

import Translation from "./translation";

interface IBountyStatusInfo {
  issueState: IssueState;
}
export default function BountyStatusInfo({ issueState }: IBountyStatusInfo) {
  function handleColorState() {
    switch (issueState?.toLowerCase()) {
      case "draft": {
        return "bg-white-50";
      }
      case "open": {
        return "bg-primary text-white";
      }
      case "in progress": {
        return "bg-primary text-white";
      }
      case "canceled": {
        return "bg-dark-gray text-white";
      }
      case "closed": {
        return "bg-dark-gray text-white";
      }
      case "ready": {
        return "bg-success";
      }
      case "done": {
        return "bg-success";
      }
      case "disputed": {
        return "bg-danger text-white";
      }
      default: {
        return "primary";
      }
    }
  }

  return (
    <span className={`status caption-small ${handleColorState()}`}>
      {issueState && <Translation ns="bounty" label={`status.${issueState}`} />}
    </span>
  );
}
