import { useTranslation } from "next-i18next";
import { UrlObject } from "url";

import If from "components/If";
import InternalLink from "components/internal-link";

interface NotFoundProps {
  message?: string;
  action?: string;
  href?: string | UrlObject;
}

export default function NotFound({
  message,
  action,
  href,
}: NotFoundProps) {
  const { t } = useTranslation("common");

  return(
    <div className={`d-flex flex-column h-100 mt-xl-5 pt-xl-5 align-items-center justify-content-between 
      justify-content-xl-start`}
    >
      <div className="d-flex d-xl-none"></div>

      <div className="caption-medium font-weight-medium text-center text-white mb-3">
        {message || t("404.not-found")}
      </div>

      <If condition={!!href}>
        <InternalLink
          className="w-100 w-xl-auto"
          href={href}
          label={action || String(t("actions.create-one"))}
          uppercase
        />
      </If>
    </div>
  );
}