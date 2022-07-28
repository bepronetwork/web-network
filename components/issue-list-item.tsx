import React from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import Avatar from "components/avatar";

import { useNetwork } from "contexts/network";

import { formatNumberToNScale } from "helpers/formatNumber";

import { IssueData } from "interfaces/issue-data";
import { IssueState } from "interfaces/issue-data";

import BountyStatusInfo from "./bounty-status-info";
import DateLabel from "./date-label";
import Identicon from "./identicon";
import Translation from "./translation";
import { formatDate } from "helpers/formatDate";

export default function IssueListItem({
  issue = null,
  xClick,
}: {
  issue?: IssueData;
  xClick?: () => void;
}) {
  const router = useRouter();
  const { activeNetwork } = useNetwork();
  const { t } = useTranslation(["bounty", "common"]);

  function renderIssueData(state: IssueState) {
    const types = {
      open: {
        value: issue.working?.length,
        translation: t("info.working"),
      },
      ready: {
        value: issue.pullRequests?.length,
        translation: t("info.pull-requests", {
          count: issue?.pullRequests?.length,
        }),
      },
      proposal: {
        value: issue?.mergeProposals?.length,
        translation: t("info.proposals", {
          count: issue?.mergeProposals?.length,
        }),
      },
    };

    if (["open", "ready", "proposal"].includes(state?.toLowerCase())) {
      const { value, translation } = types[state?.toLowerCase()];
      return (
        <div className="d-flex align-items-center" key={issue.githubId}>
          <span className="caption-medium mr-1 text-white">
            {(issue !== null && value) || 0}
          </span>
          <span className="caption-medium text-white-40 text-uppercase">
            {translation}
          </span>
        </div>
      );
    } else return null;
  }

  function renderAmount() {
    const isActive = ["closed", "canceled"].includes(issue?.state);

    const percentage = (issue?.amount * 100) / issue?.fundingAmount;

    return (
      <div
        className={`row justify-content-md-center m-0 px-1 pb-1 rounded-5 ${
          !isActive ? "bg-black" : "bg-dark-gray"
        } `}
      >
        <div className="px-0 pt-1 col-md-12">
          <span
            className={`caption-large text-opacity-1 text-white${
              isActive && "-40"
            }`}
          >
            {formatNumberToNScale(issue?.fundingAmount ? issue?.fundingAmount : issue?.amount || 0)}{" "}
            <label
              className={`caption-small text-uppercase ${
                !isActive ? "text-primary" : "text-white-40"
              }`}
            >
              ${issue?.token?.symbol || t("common:misc.token")}
            </label>
          </span>
        </div>
        {(issue?.fundingAmount <= 0 || issue?.fundingAmount) && (
          <>
            <div className="p-0 col-md-6 mt-1">
              <div className="bg-dark-gray w-100 issue-funding-progress">
                <div
                  className={`${
                    percentage !== 100 ? "bg-primary" : "bg-success"
                  } issue-funding-progress`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <div
              className={`issue-percentage-text caption-small py-0 pe-0 ps-1 pb-1 col-md-2 ${
                percentage !== 100 ? "text-white" : "text-success"
              }`}
            >
              {percentage.toFixed(0)}%
            </div>
          </>
        )}
      </div>
    );
  }

  function renderAvatar() {
    if (issue?.creatorGithub)
      return (
        <Avatar className="mr-2" size="sm" userLogin={issue?.creatorGithub} border />
      );
    if (issue?.creatorAddress)
      return (
        <Identicon className="mr-2" address={issue?.creatorAddress} size="sm" />
      );
    return null;
  }

  function createIssueDate(date: Date) {
    return (
      <span className="caption-medium text-white-40">{formatDate(date)}</span>
    );
  }

  return (
    <div
      className="bg-shadow list-item p-3"
      onClick={() => {
        if (xClick) return xClick();

        router.push({
          pathname: "/[network]/bounty",
          query: {
            id: issue?.githubId,
            repoId: issue?.repository_id,
            network: activeNetwork.name,
          },
        });
      }}
    >
      <div className="row align-center">
        <div className="col-md-10 mb-3 mb-md-0">
          <h4 className="h4 text-truncate mb-3">
            <span className="text-white-40 me-2">#{issue?.githubId}</span>
            {(issue?.title !== null && issue?.title) || (
              <Translation ns="bounty" label={"errors.fetching"} />
            )}
          </h4>
          <div className="d-flex align-center flex-wrap align-items-center justify-content-md-start mt-2 gap-20">
            <BountyStatusInfo issueState={issue.state} />
            <div className="d-flex align-items-center">
              {renderAvatar()}
              {issue?.repository && (
                <OverlayTrigger
                  key="bottom-githubPath"
                  placement="bottom"
                  overlay={
                    <Tooltip id={"tooltip-bottom"}>
                      {issue?.repository?.githubPath}
                    </Tooltip>
                  }
                >
                  <div className="bg-primary rounded-4 px-2 py-1">
                    <span className="caption-medium text-uppercase mw-github-info">
                      {issue?.repository?.githubPath.split("/")?.[1]}
                    </span>
                  </div>
                </OverlayTrigger>
              )}
            </div>
            {renderIssueData(issue?.state)}
            {createIssueDate(issue?.createdAt)}
          </div>
        </div>

        <div className="col-md-2 my-auto text-center">{renderAmount()}</div>
      </div>
    </div>
  );
}
