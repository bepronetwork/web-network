import React from "react";

import Badge from "components/badge";
import Translation from "components/translation";

import { IssueState } from "interfaces/issue-data";

interface IBountyStatusInfo {
  issueState: IssueState;
  className?: string
}

export default function BountyStatusInfo({ issueState, className }: IBountyStatusInfo) {

  const colors = {
    draft: { ellipse: "bg-info", badge: "border border-info bg-info-30 text-info" },
    open: { ellipse: "bg-success", badge: "border border-success bg-success-30 text-success"},
    canceled: { ellipse: "", badge: "border border-danger bg-danger-30 text-danger-70" },
    closed: { ellipse: "", badge: "border border-dark-gray bg-dark-gray text-white-40" },
    ready: { ellipse: "bg-success", badge: "border border-success bg-success-30 text-success" },
    proposal: { ellipse: "bg-purple", badge: "border border-purple bg-purple-30 text-purple" },
    funding: {
      ellipse: "bg-light-warning",
      badge: "border border-light-warning bg-light-warning-30 text-light-warning"
    },
  };

  return (
      <Badge
        className={`d-flex status caption-medium ${className ? className : 'py-1 px-3'} ${colors[issueState]?.badge} `}
      >
        <>
          {colors[issueState]?.ellipse && <div className={`ellipse bg-primary me-2 ${colors[issueState]?.ellipse}`} />}
          {issueState && (
            <Translation ns="bounty" label={`status.${issueState}`} />
          )}
        </>
      </Badge>
  );
}
