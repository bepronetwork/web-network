import { CSSProperties } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import { useTranslation } from "next-i18next";

export default function TokenSymbolView({
  name,
  className,
  style,
}: {
  name: string;
  className?: string;
  style?: CSSProperties;
}) {
  const { t } = useTranslation(["common"]);

  return (
    <OverlayTrigger
      key="bottom-githubPath"
      placement="bottom"
      overlay={<Tooltip id={"tooltip-bottom"}>{name}</Tooltip>}
    >
      <span className={`${className} token-symbol text-truncate`} style={style}>
        <>{name || t("common:misc.token")}</>
      </span>
    </OverlayTrigger>
  );
}
