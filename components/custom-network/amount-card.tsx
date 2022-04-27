import { useTranslation } from "next-i18next";

import Button from "components/button";
import InfoTooltip from "components/info-tooltip";

import { formatNumberToCurrency } from "helpers/formatNumber";

interface AmountCardProps {
  title: string;
  amount?: number;
  description: string;
  currency?: "token" | "oracles";
  action?: {
    label: string;
    fn: () => void;
  };
}

export default function AmountCard({
  title,
  currency,
  amount = 0,
  description,
  action
}: AmountCardProps) {
  const { t } = useTranslation("common");
  return (
    <div className="d-flex flex-column bg-shadow p-20 border-radius-8">
      <div className="d-flex flex-row align-items-center justify-content-between">
        <span className="caption-medium text-gray">{title}</span>

        <InfoTooltip description={description} />
      </div>

      <div className="d-flex flex-row align-items-center mt-3">
        <span className="h3 text-white mr-2">
          {formatNumberToCurrency(amount)}
        </span>
        {action ? (
          <Button color="warning">{action.label}</Button>
        ) : (
          (currency && (
            <span
              className={`caption-small text-${
                currency === "token" ? "primary" : "purple"
              }`}
            >
              {currency === "token" ? t("$bepro") : t("$oracles")}
            </span>
          )) ||
          ""
        )}
      </div>
    </div>
  );
}
