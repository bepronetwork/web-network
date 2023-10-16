import { useTranslation } from "next-i18next";
import Link from "next/link";
import { UrlObject } from "url";

import { ContextualSpan } from "components/contextual-span";

interface DeliverableInfoCardViewProps {
  votingPowerHref: UrlObject;
}

export default function DeliverableInfoCardView({
  votingPowerHref
}: DeliverableInfoCardViewProps) {
  const { t } = useTranslation("deliverable");

  return (
    <ContextualSpan isAlert isDismissable context='info' className="bg-info-10 mb-2">
    {t("deliverable:infos.curators")}
      <Link href={votingPowerHref}>
        <a className="text-primary">
          {t("deliverable:infos.get-voting-power")}
        </a>
      </Link>
    </ContextualSpan>
  );
}
