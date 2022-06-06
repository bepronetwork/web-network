import React from "react";

import { useTranslation } from "next-i18next";

import NothingFound from "components/nothing-found";
import PullRequestItem from "components/pull-request-item";

import { useIssue } from "contexts/issue";

export default function IssuePullRequests() {
  const { t } = useTranslation("pull-request");

  const { activeIssue, networkIssue } = useIssue();

  const hasPullRequests = !!activeIssue?.pullRequests?.length;

  return (
    <div className={`content-wrapper border-top-0 pt-0 ${ (hasPullRequests && "pb-0") || "pb-3" }`}>
      {hasPullRequests &&
        React.Children.toArray(activeIssue?.pullRequests?.map((pullRequest) => (
            <PullRequestItem
              pullRequest={pullRequest}
              networkPullRequest={networkIssue?.pullRequests?.find(pr => +pr.id === +pullRequest.contractId)}
            />
          ))) || 
        <NothingFound description={t("errors.not-found")} />
      }
    </div>
  );
}
