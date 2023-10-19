import BigNumber from "bignumber.js";

import InfoTooltip from "components/info-tooltip";

import { formatStringToCurrency } from "helpers/formatNumber";

export default function ServiceFeesModalRow({
  label,
  percentage,
  amount,
  symbol,
  border = true,
}) {
  return (
    <div
      key={label}
      className={`d-flex py-3 flex-wrap justify-content-between ${
        border ? "border-bottom border-gray-700" : ""
      }`}
    >
      <span className="text-gray">
        {label} <span className="text-white">{percentage || "0"}%</span>
      </span>
      <span className="d-flex align-items-center gap-1 text-uppercase">
        {formatStringToCurrency(BigNumber(amount).toFixed(5)) || 0} 
        <span className="text-gray">{symbol || "token"}</span>
        <InfoTooltip description={formatStringToCurrency(amount)} />
      </span>
    </div>
  );
}
