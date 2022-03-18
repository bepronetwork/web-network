import React from "react";

import { useTranslation } from "next-i18next";

import { IActiveIssue } from "contexts/issue";

import NothingFound from "./nothing-found";
import PullRequestItem from "./pull-request-item";

interface IIssuePullRequestProps {
  issue: IActiveIssue;
  className: string;
}

export default function IssuePullRequests({
  issue,
  className
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
            />
          )))) || <NothingFound description={t("errors.not-found")} />}
    </div>
  );
}
