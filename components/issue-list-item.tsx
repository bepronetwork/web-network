import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import React from "react";
import IssueAvatars from "./issue-avatars";
import { IssueData, pullRequest } from "@interfaces/issue-data";
import { IssueState } from "@interfaces/issue-data";
import { formatNumberToNScale } from "@helpers/formatNumber";
import Avatar from "components/avatar";
import GithubInfo from "@components/github-info";
import Translation from "./translation";
import { useTranslation } from "next-i18next";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNetwork } from "@contexts/network";
import BountyStatusInfo from "./bounty-status-info";
import DateLabel from "./date-label";

export default function IssueListItem({
  issue = null,
  xClick,
}: {
  issue?: IssueData;
  xClick?: () => void;
}) {
  const router = useRouter();
  const { activeNetwork } = useNetwork()
  const { t } = useTranslation("bounty");

  function handleReviewsPr(pullRequests: pullRequest[]) {
    var numberAllReviewers = 0;

    const allReviewers = pullRequests.map((pr) => {
      return pr.reviewers?.length;
    });
    allReviewers.map((num) => (numberAllReviewers = numberAllReviewers + num));
    return numberAllReviewers;
  }

  function renderProposals() {
    return (
      <div className="d-flex align-items-center">
        <span className="caption-small mr-1 text-white">
          {(issue != null && issue?.mergeProposals?.length) || 0}
        </span>
        <span className="caption-small text-white-40 text-uppercase">
          {issue?.mergeProposals?.length === 1
            ? t("info.proposals_one")
            : t("info.proposals_other")}
        </span>
      </div>
    );
  }

  function renderReviews() {
    return (
      <div className="d-flex align-items-center">
        <span className="caption-small mr-1 text-white">
          {(issue != null && handleReviewsPr(issue?.pullRequests)) || 0}
        </span>
        <span className="caption-small text-white-40 text-uppercase">
          {handleReviewsPr(issue?.pullRequests) === 1
            ? t("info.reviews_one")
            : t("info.reviews_other")}
        </span>
      </div>
    );
  }

  function renderIssueData(state: IssueState) {
    function handleFirstChildren() {
      if (state?.toLowerCase() === "ready") {
        return renderProposals();
      } else if (state?.toLowerCase() === "closed") {
        return renderReviews();
      } else {
        return (
          <div className="d-flex align-items-center">
            <span className="caption-small mr-1 text-white">
              {(issue != null && issue.working?.length) || 0}
            </span>
            <span className="caption-small text-white-40 text-uppercase">
              {t("info.working")}
            </span>
          </div>
        );
      }
    }

    if (!["draft", "pending", "canceled"].includes(state?.toLowerCase())) {
      return (
        <div className="d-flex align-center flex-wrap align-items-center justify-content-md-start mt-2 gap-20">
          {handleFirstChildren()}
          <div className="d-flex align-items-center">
            <span className="caption-small mr-1 text-white">
              {(issue != null && issue.pullRequests?.length) || 0}
            </span>
            <span className="caption-small text-white-40 text-uppercase">
              {issue?.pullRequests?.length === 1
                ? t("info.pull-requests_one")
                : t("info.pull-requests_other")}
            </span>
          </div>
          {state?.toLowerCase() === "ready"
            ? renderReviews()
            : renderProposals()}
          {state?.toLowerCase() !== "draft" && <DateLabel date={issue?.createdAt}/>}
        </div>
      );
    } else {
      return;
    }
  }

  return (
    <div
      className="bg-shadow list-item p-4"
      onClick={() => {
        if (xClick) return xClick();

        router.push({
          pathname: "/[network]/bounty",
          query: { id: issue?.githubId, repoId: issue?.repository_id, network: activeNetwork.name },
        });
      }}
    >
      <div className="row align-center">
        <div className="col-md-10 mb-3 mb-md-0">
        <h4 className="h4 text-truncate">
              <span className="text-gray trans me-2">#{issue?.githubId}</span>
              {(issue?.title !== null && issue?.title) || (
                <Translation ns="bounty" label={`errors.fetching`} />
              )}
            </h4>
          <div className="d-flex align-center flex-wrap align-items-center justify-content-md-start mt-2 gap-20">
            <BountyStatusInfo issueState={issue.state}/>
            <div className="d-flex align-items-center">
              <Avatar className="mr-1" userLogin={issue?.creatorGithub} border />
              <OverlayTrigger
                key="bottom-creator"
                placement="bottom"
                overlay={
                  (issue?.creatorGithub?.length > 25 && (
                    <Tooltip id={`tooltip-bottom`}>
                      @{issue?.creatorGithub}
                    </Tooltip>
                  )) || <></>
                }
                >
                <span className="p-small mw-github-info">
                  <GithubInfo
                    parent="list"
                    variant="user"
                    label={[`@`, issue?.creatorGithub].join(``)}
                    />
                </span>
              </OverlayTrigger>
            </div>
            {issue?.repository && (
              <OverlayTrigger
                key="bottom-githubPath"
                placement="bottom"
                overlay={
                  (issue?.repository?.githubPath?.length > 25 && (
                    <Tooltip id={`tooltip-bottom`}>
                      {issue?.repository?.githubPath}
                    </Tooltip>
                  )) || <></>
                }
              >
                <span className="p-small text-uppercase mw-github-info">
                  <GithubInfo
                    parent="list"
                    variant="repository"
                    label={issue?.repository?.githubPath}
                    onClick={() =>
                      router.push({
                        pathname: `/`,
                        query: { repoId: issue?.repository_id },
                      })
                    }
                  />
                </span>
              </OverlayTrigger>
            )}
            {issue?.state === "draft" && <DateLabel date={issue?.createdAt}/>}
          </div>
          {renderIssueData(issue?.state)}
        </div>
        <div className="col-md-2 my-auto text-center">
          <span className="caption-large text-white text-opacity-1">
            {formatNumberToNScale(issue?.amount || 0)}{" "}
            <label className="text-uppercase text-primary">
              <Translation label={`$bepro`} />
            </label>
          </span>
          {(issue?.developers?.length > 0 && (
            <IssueAvatars users={issue?.developers}></IssueAvatars>
          )) ||
            ``}
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
