import React from "react";

import { useTranslation } from "next-i18next";

import { IActiveIssue } from "contexts/issue";

import { BountyExtended } from "interfaces/bounty";

import NothingFound from "./nothing-found";
import PullRequestItem from "./pull-request-item";

interface IIssuePullRequestProps {
  issue: IActiveIssue;
  networkIssue: BountyExtended;
  className: string;
}

export default function IssuePullRequests({
  issue,
  className,
  networkIssue
}: IIssuePullRequestProps) {
  const { t } = useTranslation("pull-request");

  return (
    <div
      className={`content-wrapper ${className || ""} pt-0 ${
        (issue?.pullRequests?.length > 0 && "pb-0") || "pb-3"
      }`}
    >
      {(issue?.pullRequests?.length > 0 &&
        React.Children.toArray(issue?.pullRequests?.map((pullRequest) => (
            <PullRequestItem
              key={pullRequest.id}
              issue={issue}
              pullRequest={pullRequest}
              networkPullRequest={networkIssue?.pullRequests?.find(pr => +pr.id === +pullRequest.contractId)}
            />
          )))) || <NothingFound description={t("errors.not-found")} />}
    </div>
  );
}
