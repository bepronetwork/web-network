import { formatNumberToCurrency } from "helpers/formatNumber";

import { BountyDistribution } from "interfaces/bounty-distribution";

import InfoTooltip from "./info-tooltip";

export default function BountyDistributionItem({
  percentage = 0,
  name,
  symbols,
  amounts,
  description,
  line,
}: BountyDistribution) {
  function verifyAmount(): boolean {
    if (amounts.length > 1 && amounts[1] > 0) {
      return true;
    } else {
      return false;
    }
  }

  return (
    <>
      <li
        className="d-flex align-items-center px-3 py-1 my-1 rounded-3 mb-2"
        key={name}
      >
        <div className="d-flex flex-grow-1 flex-column">
          <span className="caption-medium text-truncate pb-1">
            {name} {percentage}%{" "}
            {description && (
              <InfoTooltip description={description} secondaryIcon={true} />
            )}
          </span>
          {verifyAmount() && (
            <span className="caption-small text-ligth-gray">{name}</span>
          )}
        </div>

        <div className={"d-flex flex-shrink-0 w-40 flex-column"}>
          <div className="d-flex justify-content-end">
            <span className="caption-medium pb-1">
              {formatNumberToCurrency(amounts[0])}{" "}
            </span>
            <label className="ps-1 pt-1 caption-small text-uppercase text-white-40">
              {symbols[0]}
            </label>
          </div>
          {verifyAmount() && (
            <div className="d-flex justify-content-end">
              <span className="caption-small text-ligth-gray">
                {formatNumberToCurrency(amounts[1])}{" "}
                <label className="ps-1 caption-small text-uppercase text-ligth-gray">
                  {symbols[1]}
                </label>
              </span>
            </div>
          )}
        </div>
      </li>
      {line && <div className="mx-3 line bg-ligth-gray"></div>}
    </>
  );
}
