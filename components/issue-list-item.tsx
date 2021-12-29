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
import { OverlayTrigger, Tooltip } from "react-bootstrap";

export default function IssueListItem({
  issue = null,
  xClick,
}: {
  issue?: IssueData;
  xClick?: () => void;
}) {
  const router = useRouter();
  const { t } = useTranslation("bounty");

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
            duration.years === 1 ? t(`info-data.year`) : t(`info-data.years`)
          }`,
        };
      } else if (duration.months > 0) {
        return {
          value: `${duration.months} ${
            duration.months === 1 ? t(`info-data.month`) : t(`info-data.months`)
          }`,
        };
      } else if (duration.days > 0) {
        return {
          value: `${duration.days} ${
            duration.days === 1 ? t(`info-data.day`) : t(`info-data.days`)
          }`,
        };
      } else if (duration.hours > 0) {
        return {
          value: `${duration.hours} ${
            duration.hours === 1 ? t(`info-data.hour`) : t(`info-data.hours`)
          }`,
        };
      } else if (duration.minutes > 0) {
        return {
          value: `${duration.minutes} ${
            duration.minutes === 1
              ? t(`info-data.minute`)
              : t(`info-data.minutes`)
          }`,
        };
      } else if (duration.seconds > 0) {
        return {
          value: `${duration.seconds} ${
            duration.seconds === 1
              ? t(`info-data.second`)
              : t(`info-data.seconds`)
          }`,
        };
      }
    }

    return (
      <span className="small-info mr-2 mt-2 text-uppercase">
        {data && t(`info-data.text-data`, handleDurationTranslation())}
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
          {issue?.mergeProposals?.length === 1
            ? t("info.proposals_one")
            : t("info.proposals_other")}
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
          <div className="flex mr-1 mt-1 flex-row">
            <span className="caption-small mr-1 text-white">
              {(issue != null && issue.working.length) || 0}
            </span>
            <span className="caption-small text-ligth-gray text-uppercase">
              {t("info.working")}
            </span>
          </div>
        );
      }
    }

    if (!["draft", "pending", "canceled"].includes(state?.toLowerCase())) {
      return (
        <div className="d-flex align-center flex-wrap align-items-center justify-content-md-start">
          {handleFirstChildren()}
          <div className="flex mr-1 mt-1 flex-row">
            <span className="caption-small mr-1 text-white">
              {(issue != null && issue.pullRequests.length) || 0}
            </span>
            <span className="caption-small text-ligth-gray text-uppercase">
              {issue?.pullRequests?.length === 1
                ? t("info.pull-requests_one")
                : t("info.pull-requests_other")}
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
          <OverlayTrigger
            key="bottom"
            placement="bottom"
            overlay={
              (issue?.title.length > 61 && (
                <Tooltip id={`tooltip-bottom`}>{issue?.title}</Tooltip>
              )) || <></>
            }
          >
            <h4 className="h4 text-truncate">
              <span className="text-gray trans me-2">#{issue?.githubId}</span>
              {(issue?.title !== null &&
                handleBiggerName(issue?.title, 61)) || (
                <Translation ns="bounty" label={`errors.fetching`} />
              )}
            </h4>
          </OverlayTrigger>
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
            <OverlayTrigger
              key="bottom"
              placement="bottom"
              overlay={
                (issue?.creatorGithub.length > 30 && (
                  <Tooltip id={`tooltip-bottom`}>
                    @{issue?.creatorGithub}
                  </Tooltip>
                )) || <></>
              }
            >
              <span className="p-small mr-2 mt-1">
                <GithubInfo
                  color="gray"
                  value={[`@`, handleBiggerName(issue?.creatorGithub, 30)].join(
                    ``
                  )}
                />
              </span>
            </OverlayTrigger>
            {issue?.repository && (
              <OverlayTrigger
                key="bottom"
                placement="bottom"
                overlay={
                  (issue?.repository?.githubPath.length > 30 && (
                    <Tooltip id={`tooltip-bottom`}>
                      {issue?.repository?.githubPath}
                    </Tooltip>
                  )) || <></>
                }
              >
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
              </OverlayTrigger>
            )}
            {issue?.state === "draft" && renderData(issue?.createdAt)}
          </div>
          {renderIssueData(issue?.state)}
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
