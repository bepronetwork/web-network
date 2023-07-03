import { useTranslation } from "next-i18next";
import Link from "next/link";
import { UrlObject } from "url";

import ArrowRight from "assets/icons/arrow-right";
import CloseIcon from "assets/icons/close-icon";

import Button from "components/button";

interface BecomeCuratorCardViewProps {
  show: boolean;
  onHide: () => void;
  councilAmount: string;
  networkTokenSymbol: string;
  votingPowerHref: UrlObject;
}

export default function BecomeCuratorCardView({
  show,
  onHide,
  councilAmount,
  networkTokenSymbol,
  votingPowerHref,
}: BecomeCuratorCardViewProps) {
  const { t } = useTranslation("council");

  if (!show) return <></>;

  return (
    <div className="become-council p-2 ps-4 pb-3">
      <div className="d-flex d-flex justify-content-end">
        <Button
          transparent
          className="card-close-button p-1"
          onClick={onHide}
        >
          <CloseIcon className="text-purple" />
        </Button>
      </div>

      <h4 className="h4 pb-2">{t("become-council")}</h4>

      <div className="text-gray pe-3 pb-2">
        {t("become-council-description-part-one")}{" "}

        <span className="amount-white-color">
          {councilAmount}
        </span>{" "}

        <span className="text-primary">
          {networkTokenSymbol}
        </span>{" "}

        {t("become-council-description-part-two")}
      </div>
      
      <Link href={votingPowerHref}>
        <a className="text-decoration-none text-purple text-uppercase">
          {t("go-to-lock-unlock")}{" "}

          <ArrowRight className="text-purple ms-2 mb-1" />
        </a>
      </Link>
    </div>
  );
}
