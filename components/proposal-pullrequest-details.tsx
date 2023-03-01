import { useTranslation } from "next-i18next";

import Avatar from "components/avatar";
import DateLabel from "components/date-label";
import GithubInfo from "components/github-info";
import PullRequestLabels from "components/pull-request-labels";
import Translation from "components/translation";

import { useAppState } from "contexts/app-state";

import { pullRequest } from "interfaces/issue-data";

interface IProposalPRDetailsProps {
  currentPullRequest: pullRequest;
}
export default function ProposalPullRequestDetail({
  currentPullRequest,
}: IProposalPRDetailsProps) {
  const { t } = useTranslation("pull-request");
  const { state } = useAppState();

  return (
    <>
      <div className="pt-1 mb-2 d-inline-flex align-items-center justify-content-md-start gap-2">
        <span className="caption-large text-uppercase text-white">
          {t("pull-request:label")}
        </span>
        <span className="caption-large text-uppercase text-white-40">
          #{currentPullRequest?.githubId}
        </span>
        <PullRequestLabels
          merged={currentPullRequest?.merged}
          isMergeable={currentPullRequest?.isMergeable}
        />
      </div>
      <div className="pt-1 mb-3 d-inline-flex align-items-center justify-content-md-start gap-3">
        <div className="d-flex align-items-center">
          <Avatar
            className="me-2"
            userLogin={currentPullRequest?.githubLogin}
          />{" "}
          <GithubInfo
            parent="hero"
            variant="user"
            label={["@", currentPullRequest?.githubLogin].join("")}
          />
        </div>

        <span className="caption-small">
          {(state.currentBounty?.data?.repository && (
            <GithubInfo
              parent="list"
              variant="repository"
              label={state.currentBounty?.data?.repository?.githubPath}
            />
          )) ||
            ""}
        </span>

        <span className="caption-small text-light-gray text-uppercase">
          <Translation label={"branch"} />:
          <span className="text-primary">
            {currentPullRequest?.userBranch}
          </span>
        </span>

        {currentPullRequest?.createdAt && (
          <DateLabel
            date={currentPullRequest?.createdAt}
            className="text-white"
          />
        )}
      </div>
    </>
  );
}
