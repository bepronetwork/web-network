import { useTranslation } from "next-i18next";
import { UrlObject } from "url";

import Avatar from "components/avatar";
import DateLabel from "components/date-label";
import GithubInfo from "components/github-info";
import InternalLink from "components/internal-link";
import PullRequestLabels from "components/pull-request/labels/controller";
import Translation from "components/translation";

interface PullRequestDetailsViewProps {
  githubId: string;
  creatorGithubLogin: string;
  branch: string;
  createdAt: Date;
  isMerged: boolean;
  isMergeable: boolean;
  pullRequestHref: UrlObject;
}

export default function PullRequestDetailsView({
  githubId,
  creatorGithubLogin,
  branch,
  createdAt,
  isMerged,
  isMergeable,
  pullRequestHref,
}: PullRequestDetailsViewProps) {
  const { t } = useTranslation("pull-request");

  return (
    <>
      <div className="row align-items-center gy-2">
        <div className="col-auto">
          <span className="caption-large text-capitalize text-white">
            {t("pull-request:label")}
          </span>
        </div>

        <div className="col col-md-auto px-0">
          <InternalLink
            href={pullRequestHref}
            title={t("actions.go-to-pull-request")}
            className="caption-large text-gray-500 p-0 hover-primary text-decoration-underline"
            label={`#${githubId || ""}`}
            transparent
          />
        </div>

        <div className="col-auto">
          <PullRequestLabels merged={isMerged} isMergeable={isMergeable} />
        </div>
      </div>

      <div className="row align-items-center mt-2 gap-3">
        <div className="col-xs-12 col-xl-auto">
          <div className="row align-items-center">
            <div className="col-auto">
              <Avatar userLogin={creatorGithubLogin} />
            </div>

            <div className="col-auto px-0">
              <GithubInfo
                parent="hero"
                variant="user"
                label={`@${creatorGithubLogin}`}
              />
            </div>
          </div>
        </div>

        <div className="col-xs-12 col-xl-auto">
          <span className="caption-small text-light-gray text-uppercase">
            <Translation label={"branch"} />:
            <span className="text-primary">{branch}</span>
          </span>
        </div>

        <div className="col-xs-12 col-xl-auto">
          <DateLabel date={createdAt} className="text-gray-500" />
        </div>
      </div>
    </>
  );
}
