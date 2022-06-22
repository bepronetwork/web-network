import ArrowRightLine from "assets/icons/arrow-right-line";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { BountyDistribution } from "interfaces/bounty-distribution";

import InfoTooltip from "./info-tooltip";


export default function BountyDistributionItem({
  percentage = 0,
  name,
  symbol,
  amount,
  description,
}: BountyDistribution) {
  return (
    <li className="d-flex align-items-center px-3 py-1 my-1 rounded-3" key={name}>
      <span className="flex-grow-1 caption-small text-truncate">
        {name} {description && <InfoTooltip description={description} />}
      </span>

      <div className={"flex-shrink-0 w-40"}>
        <span className="caption-medium">
          <label className="caption-medium text-white-40 text-uppercase">
            {percentage}%{" "}
            <ArrowRightLine
              className="text-white-40 mb-1"
              width={10}
              height={10}
            />
          </label>{" "}
          {formatNumberToCurrency(amount)}{" "}
          <label className="caption-medium text-uppercase text-primary">
            {symbol}
          </label>
        </span>
      </div>
    </li>
  );
}
