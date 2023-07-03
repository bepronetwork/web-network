import { useTranslation } from "next-i18next";

import GithubLink from "components/github-link";

export default function ApproveLink({
  hrefPath,
  forcePath,
  color = "primary",
  className,
}: {
  hrefPath?: string;
  forcePath?: string;
  color?: string;
  className?: string;
}) {
  const { t } = useTranslation(["common"]);

  return (
    <GithubLink
      className={className}
      forcePath={hrefPath}
      hrefPath={forcePath}
      color={color}
    >
      {t("actions.approve")}
    </GithubLink>
  );
}
