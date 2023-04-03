import { useTranslation } from "next-i18next";

interface ClosedNetworkAlertProps {
  isVisible?: boolean;
}

export default function ClosedNetworkAlert({ isVisible } : ClosedNetworkAlertProps) {
  const { t } = useTranslation("common");

  if (!isVisible) return <></>;

  return (
    <div className="bg-shadow">
      <div className="d-flex align-items-center justify-content-center 
                      caption-medium text-danger bg-danger-30 w-100 py-1">
        <span>{t("errors.read-only-network")}</span>
      </div>
    </div>
  );
}
