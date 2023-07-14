import { useTranslation } from "next-i18next";

import CloseIcon from "assets/icons/close-icon";
import InfoIconEmpty from "assets/icons/info-icon-empty";

import Button from "components/button";

interface BecomeCuratorCardViewProps {
  show: boolean;
  onHide: () => void;
}

export default function VotingPowerInfoCardView({
  show,
  onHide,
}: BecomeCuratorCardViewProps) {
  const { t } = useTranslation("profile");

  if (!show) return <></>;

  return (
    <div className="bg-info-10 border border-info border-radius-8 p-2 ps-3 pb-3">
      <div className="d-flex d-flex justify-content-end">
        <Button transparent className="card-close-button p-0" onClick={onHide}>
          <CloseIcon className="text-info" />
        </Button>
      </div>
      <div className="me-3">
      <span>
        <InfoIconEmpty className="text-info me-2 mb-1" width={12} height={12} />
        {t("profile:need-network-to-manage")}
      </span>
      </div>
    </div>
  );
}
