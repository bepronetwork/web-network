import InfoTooltip from "components/info-tooltip";

import {formatNumberToNScale} from "helpers/formatNumber";

interface AmountCardProps {
  title: string;
  amount?: number;
  description: string;
}

export default function AmountCard({
  title,
  amount = 0,
  description
}: AmountCardProps) {
  
  return (
    <div className="d-flex flex-column bg-shadow p-3 border-radius-8">
      <div className="d-flex flex-row align-items-center justify-content-between">
        <span className="caption-medium text-gray font-weight-normal">{title}</span>

        <InfoTooltip description={description} />
      </div>

      <div className="d-flex flex-row align-items-center mt-3">
        <h4 className="family-Regular text-white">
          {formatNumberToNScale(amount)}
        </h4>
      </div>
    </div>
  );
}
