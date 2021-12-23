import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { formatDate } from "@helpers/formatDate";
import IssueAvatars from "./issue-avatars";
import { IssueData, pullRequest } from "@interfaces/issue-data";
import { IssueState } from "@interfaces/issue-data";
import { formatNumberToNScale } from "@helpers/formatNumber";
import Avatar from "components/avatar";
import GithubInfo from "@components/github-info";
import Translation from "./translation";

export default function IssueListItem({
  issue = null,
  xClick,
}: {
  issue?: IssueData;
  xClick?: () => void;
}) {
  const router = useRouter();

  function handleColorState(state: IssueState) {
    switch (state?.toLowerCase()) {
      case "draft": {
        return "bg-white-50";
      }
      case "open": {
        return "bg-blue text-white";
      }
      case "in progress": {
        return "bg-blue text-white";
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
      // REVIEW: redeem not exist in figma
      case "redeemed": {
        return "blue";
      }
      default: {
        return "blue";
      }
    }
  }

  function renderData(data: Date) {
    return (
      <span className="p-small mr-2 mt-1 text-white-50">
        {issue != null && formatDate(data)}
      </span>
    );
  }

  function renderProposals() {
    return (
      <div className="flex me-3 mt-1 flex-row">
        <span className="mediumInfo  mr-1 text-white-50">
          {(issue != null && issue.mergeProposals.length + 40) || 0}
        </span>
        <span className="mediumInfo text-ligth-gray">proposals</span>
      </div>
    );
  }

  function handleReviewsPr(pullRequests: pullRequest[]) {
    var numberAllReviewers = 0;

    const allReviewers = pullRequests.map((pr) => {
      return pr.reviewers.length;
    });

    allReviewers.map((num) => (numberAllReviewers = numberAllReviewers + num));

    return numberAllReviewers;
  }

  return (
    <div
      className="bg-shadow list-item p-4 mb-3"
      onClick={() => {
        if (xClick) return xClick();

        router.push({
          pathname: "/bounty",
          query: { id: issue?.githubId, repoId: issue?.repository_id },
        });
      }}
    >
      <div className="row align-center">
        <div className="col-md-10 mb-3 mb-md-0">
          <h4 className="h4 text-truncate">
            <span className="text-gray trans me-2">#{issue?.githubId}</span>
            {(issue?.title || ``).length > 61
              ? (issue?.title || ``).substring(0, 61) + "..."
              : issue?.title || (
                  <Translation ns="bounty" label={`errors.fetching`} />
                )}
          </h4>
          <div className="d-flex align-center flex-wrap align-items-center justify-content-md-start mt-2">
            <span
              className={`status caption-small ${handleColorState(
                issue?.state
              )} mr-2`}
            >
              {issue && (
                <Translation ns="bounty" label={`status.${issue.state}`} />
              )}
            </span>
            <Avatar className="mx-2" userLogin={issue?.creatorGithub} />
            <span className="p-small mr-2 mt-1">
              <GithubInfo
                color="gray"
                value={[`@`, issue?.creatorGithub].join(``)}
              />
            </span>
            {issue?.repo && (
              <span className="p-small mr-2 mt-1 text-uppercase">
                <GithubInfo
                  color="blue"
                  value={issue?.repo}
                  hoverTextColor="white"
                  onClicked={() =>
                    router.push({
                      pathname: `/`,
                      query: { repoId: issue?.repository_id },
                    })
                  }
                />
              </span>
            )}
            {issue?.state === "draft" && renderData(issue?.createdAt)}
          </div>
          {!["draft", "pending", "canceled"].includes(issue?.state) && (
            <div className="d-flex align-center flex-wrap align-items-center justify-content-md-start mt-2">
              {issue?.state === "ready" ? (
                renderProposals()
              ) : (
                <div className="flex mr-1 mt-1 flex-row">
                  <span className="mediumInfo  mr-1 text-white-50">
                    {(issue != null && issue.working.length + 10) || 0}
                  </span>
                  <span className="mediumInfo text-ligth-gray">working</span>
                </div>
              )}
              <div className="flex mr-1 mt-1 flex-row">
                <span className="mediumInfo  mr-1 text-white-50 ">
                  {(issue != null && issue.pullRequests.length + 10) || 0}
                </span>
                <span className="mediumInfo text-ligth-gray">pr's</span>
              </div>
              {issue?.state === "ready" ? (
                <div className="flex me-3 mt-1 flex-row">
                  <span className="mediumInfo  mr-1 text-white-50">
                    {(issue != null &&
                      handleReviewsPr(issue?.pullRequests) + 40) ||
                      0}
                  </span>
                  <span className="mediumInfo text-ligth-gray">Reviews</span>
                </div>
              ) : (
                renderProposals()
              )}

              {issue?.state !== "draft" && renderData(issue?.createdAt)}
            </div>
          )}
        </div>
        <div className="col-md-2 my-auto text-center">
          <span className="caption-large text-white text-opacity-1">
            {formatNumberToNScale(issue?.amount || 0)}{" "}
            <label className="text-uppercase text-blue">
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
