import { useTranslation } from "next-i18next";
import { UrlObject } from "url";

import AvatarOrIdenticon from "components/avatar-or-identicon";
import DateLabel from "components/date-label";
import PullRequestLabels from "components/deliverable/labels/controller";
import InternalLink from "components/internal-link";
import Translation from "components/translation";

import { User } from "interfaces/api";

interface DeliverableDetailsViewProps {
  id: number;
  user: User;
  deliverableUrl: string;
  createdAt: Date;
  isMerged: boolean;
  isMergeable: boolean;
  deliverableHref: UrlObject;
}

export default function DeliverableDetailsView({
  id,
  user,
  deliverableUrl,
  createdAt,
  isMerged,
  isMergeable,
  deliverableHref,
}: DeliverableDetailsViewProps) {
  const { t } = useTranslation("deliverable");

  return (
    <>
      <div className="row align-items-center gy-2">
        <div className="col-auto">
          <span className="caption-large text-capitalize text-white">
            {t("deliverable:label")}
          </span>
        </div>

        <div className="col col-md-auto px-0">
          <InternalLink
            href={deliverableHref}
            title={t("actions.go-to-deliverable")}
            className="caption-large text-gray-500 p-0 hover-primary text-decoration-underline"
            label={`#${id || ""}`}
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
              <AvatarOrIdenticon user={user?.githubLogin} address={user?.address} />
            </div>
          </div>
        </div>

        <div className="col-xs-12 col-xl-auto">
          <span className="caption-small text-light-gray text-uppercase">
            <Translation label={"branch"} />:
            <span className="text-primary">{deliverableUrl}</span>
          </span>
        </div>

        <div className="col-xs-12 col-xl-auto">
          <DateLabel date={createdAt} className="text-gray-500" />
        </div>
      </div>
    </>
  );
}
