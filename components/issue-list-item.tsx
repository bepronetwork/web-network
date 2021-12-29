import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import IssueAvatars from "./issue-avatars";
import { IssueData, pullRequest } from "@interfaces/issue-data";
import { IssueState } from "@interfaces/issue-data";
import { formatNumberToNScale } from "@helpers/formatNumber";
import Avatar from "components/avatar";
import GithubInfo from "@components/github-info";
import Translation from "./translation";
import { useTranslation } from "next-i18next";
import { intervalToDuration } from "date-fns";

export default function IssueListItem({
  issue = null,
  xClick,
}: {
  issue?: IssueData;
  xClick?: () => void;
}) {
  const router = useRouter();
  const { t } = useTranslation("common");

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

  function handleReviewsPr(pullRequests: pullRequest[]) {
    var numberAllReviewers = 0;

    const allReviewers = pullRequests.map((pr) => {
      return pr.reviewers.length;
    });
    allReviewers.map((num) => (numberAllReviewers = numberAllReviewers + num));
    return numberAllReviewers;
  }

  function handleBiggerName(name: string, maxSize: number) {
    if (name.length > maxSize) {
      return [name.substring(0, maxSize), "..."].join("");
    } else {
      return name;
    }
  }

  function renderData(data: Date) {
    const duration = intervalToDuration({
      start: new Date(data),
      end: new Date(),
    });

    function handleDurationTranslation() {
      if (duration.years > 0) {
        return {
          value: `${duration.years} ${
            duration.years === 1 ? t(`data.year`) : t(`data.years`)
          }`,
        };
      } else if (duration.months > 0) {
        return {
          value: `${duration.months} ${
            duration.months === 1 ? t(`data.month`) : t(`data.months`)
          }`,
        };
      } else if (duration.days > 0) {
        return {
          value: `${duration.days} ${
            duration.days === 1 ? t(`data.day`) : t(`data.days`)
          }`,
        };
      } else if (duration.hours > 0) {
        return {
          value: `${duration.hours} ${
            duration.hours === 1 ? t(`data.hour`) : t(`data.hours`)
          }`,
        };
      } else if (duration.minutes > 0) {
        return {
          value: `${duration.minutes} ${
            duration.minutes === 1 ? t(`data.minute`) : t(`data.minutes`)
          }`,
        };
      } else if (duration.seconds > 0) {
        return {
          value: `${duration.seconds} ${
            duration.seconds === 1 ? t(`data.second`) : t(`data.seconds`)
          }`,
        };
      }
    }

    return (
      <span className="small-info mr-2 mt-2 text-uppercase">
        {data && t(`data.text-data`, handleDurationTranslation())}
      </span>
    );
  }

  function renderProposals() {
    return (
      <div className="flex me-3 mt-1 flex-row">
        <span className="caption-small  mr-1 text-white">
          {(issue != null && issue.mergeProposals.length) || 0}
        </span>
        <span className="caption-small text-ligth-gray text-uppercase">
          {t("issue.proposals")}
        </span>
      </div>
    );
  }

  function renderReviews() {
    return (
      <div className="flex me-3 mt-1 flex-row">
        <span className="caption-small mr-1 text-white">
          {(issue != null && handleReviewsPr(issue?.pullRequests)) || 0}
        </span>
        <span className="caption-small text-ligth-gray text-uppercase">
          {t("issue.reviews")}
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
          <div className="flex mr-1 mt-1 flex-row">
            <span className="caption-small mr-1 text-white">
              {(issue != null && issue.working.length) || 0}
            </span>
            <span className="caption-small text-ligth-gray text-uppercase">
              {t("issue.working")}
            </span>
          </div>
        );
      }
    }

    if (!["draft", "pending", "canceled"].includes(state?.toLowerCase())) {
      return (
        <div className="d-flex align-center flex-wrap align-items-center justify-content-md-start mt-2">
          {handleFirstChildren()}
          <div className="flex mr-1 mt-1 flex-row">
            <span className="caption-small mr-1 text-white">
              {(issue != null && issue.pullRequests.length) || 0}
            </span>
            <span className="caption-small text-ligth-gray text-uppercase">
              {t("issue.pull-requests")}
            </span>
          </div>
          {state?.toLowerCase() === "ready"
            ? renderReviews()
            : renderProposals()}
          {state?.toLowerCase() !== "draft" && renderData(issue?.createdAt)}
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
          pathname: "/bounty",
          query: { id: issue?.githubId, repoId: issue?.repository_id },
        });
      }}
    >
      <div className="row align-center">
        <div className="col-md-10 mb-3 mb-md-0">
          <h4 className="h4 text-truncate">
            <span className="text-gray trans me-2">#{issue?.githubId}</span>
            {console.log("issue", issue)}
            {(issue?.title !== null && handleBiggerName(issue?.title, 61)) || (
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
            <Avatar className="mx-2" userLogin={issue?.creatorGithub} border />
            <span className="p-small mr-2 mt-1">
              <GithubInfo
                color="gray"
                value={[`@`, handleBiggerName(issue?.creatorGithub, 30)].join(
                  ``
                )}
              />
            </span>
            {issue?.repository && (
              <span className="p-small mr-2 mt-1 text-uppercase">
                <GithubInfo
                  color="blue"
                  value={handleBiggerName(issue?.repository?.githubPath, 30)}
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
          {renderIssueData(issue?.state)}

          {/* <div className="d-flex align-center flex-wrap align-items-center justify-content-md-start mt-2">
            <span className="caption-small mr-2">
              <span className="text-white">{issue?.working.length}{' '}</span>
              <span className="text-gray"><Translation ns="bounty" label={`info.working`} /></span>
            </span>

            <span className="caption-small mr-2">
              <span className="text-white">{issue?.pullRequests.length}{' '}</span>
              <span className="text-gray"><Translation ns="bounty" label={`info.pull-requests`} params={{count: issue?.pullRequests.length}} /></span>
            </span>

            <span className="caption-small mr-2">
              <span className="text-white">{issue?.mergeProposals.length}{' '}</span>
              <span className="text-gray"><Translation ns="bounty" label={`info.proposals`} params={{count: issue?.mergeProposals.length}} /></span>
            </span>

            <span className="caption-small text-gray">
              {issue != null && formatDate(issue?.createdAt)}
            </span>
          </div>*/}
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
