import React from "react";

import {useTranslation} from "next-i18next";

import NothingFound from "components/nothing-found";
import PullRequestItem from "components/pull-request-item";

import {useAppState} from "../contexts/app-state";

export default function IssuePullRequests() {
  const { t } = useTranslation("pull-request");

  const {state} = useAppState();
  const hasPullRequests = !!state.currentBounty?.data?.pullRequests?.length;

  return (
    <div className={`content-wrapper border-top-0 pt-0 ${ (hasPullRequests && "pb-0") || "pb-3" }`}>
      {hasPullRequests &&
        React.Children.toArray(state.currentBounty?.data?.pullRequests?.map((pullRequest) => (
            <PullRequestItem
              pullRequest={pullRequest}
              networkPullRequest={
                state.currentBounty?.chainData?.pullRequests?.find(pr => +pr.id === +pullRequest.contractId)
              }
            />
          ))) || 
        <NothingFound description={t("errors.not-found")} />
      }
    </div>
  );
}
