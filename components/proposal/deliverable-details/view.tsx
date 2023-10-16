import { useTranslation } from "next-i18next";
import { UrlObject } from "url";

import AvatarOrIdenticon from "components/avatar-or-identicon";
import DateLabel from "components/date-label";
import InternalLink from "components/internal-link";

import { truncateAddress } from "helpers/truncate-address";

import { User } from "interfaces/api";

interface DeliverableDetailsViewProps {
  id: number;
  user: User;
  deliverableTitle?: string;
  createdAt: Date;
  deliverableHref: UrlObject;
}

export default function DeliverableDetailsView({
  id,
  user,
  deliverableTitle,
  createdAt,
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

        <div className="col-xs-12 col-xl text-overflow-ellipsis">
          <span className="base-medium text-gray-100">
            {deliverableTitle}
          </span>
        </div>
      </div>

      <div className="row align-items-center mt-2 gap-2">
        <div className="col-xs-12 col-xl-auto">
          <div className="row align-items-center">
            <div className="col-auto">
              <AvatarOrIdenticon user={user?.githubLogin} address={user?.address} />
            </div>
            <div className="col-auto p-0">
              {user?.githubLogin ? `@${user?.githubLogin}` : user?.address ? truncateAddress(user?.address) : null}
            </div>
          </div>
        </div>

        <div className="col-xs-12 col-xl-auto">
          <DateLabel date={createdAt} className="text-gray-500" />
        </div>
      </div>
    </>
  );
}
