import InfoTooltip from "components/info-tooltip";

import { formatNumberToNScale } from "helpers/formatNumber";

import { AmountCardProps } from "types/components";

export default function AmountCard({
  title,
  amount = 0,
  description,
  fixed
}: AmountCardProps) {
  
  return (
    <div className="d-flex flex-column bg-gray-900 p-3 border border-gray-800 border-radius-8">
      <div className="d-flex flex-row align-items-center justify-content-between">
        <span className="caption-medium text-gray font-weight-normal">{title}</span>

        <InfoTooltip description={description} />
      </div>

      <div className="d-flex flex-row align-items-center mt-3">
        <h4 className="family-Regular text-white">
          {formatNumberToNScale(amount, fixed)}
        </h4>
      </div>
    </div>
  );
}
