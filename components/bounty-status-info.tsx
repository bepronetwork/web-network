import React from "react";

import { IssueState } from "interfaces/issue-data";

import Badge from "./badge";
import Translation from "./translation";

interface IBountyStatusInfo {
  issueState: IssueState;
}

export default function BountyStatusInfo({ issueState }: IBountyStatusInfo) {

  const colors = {
    draft: { ellipse: "bg-info", badge: "bg-info-30 text-info" },
    open: { ellipse: "bg-success", badge: "bg-success-30 text-success"},
    canceled: { ellipse: "", badge: "bg-danger-30 text-danger-70" },
    closed: { ellipse: "", badge: "bg-dark-gray text-white-40" },
    ready: { ellipse: "bg-success", badge: "bg-success-30 text-success" },
    proposal: { ellipse: "bg-purple", badge: "bg-purple-30 text-purple" },
    funding: { ellipse: "bg-light-warning", badge: "bg-light-warning-30 text-light-warning" },
  };

  return (
      <Badge
        className={`d-flex status caption-medium py-1 px-3 ${colors[issueState]?.badge}`}
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
