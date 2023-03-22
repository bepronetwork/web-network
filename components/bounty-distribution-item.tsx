import BigNumber from "bignumber.js";

import ArrowRight from "assets/icons/arrow-right";

import { formatNumberToNScale } from "helpers/formatNumber";

import { BountyDistribution } from "interfaces/bounty-distribution";

import Avatar from "./avatar";
import InfoTooltip from "./info-tooltip";

export default function BountyDistributionItem({
  percentage = "0",
  name,
  symbols,
  amounts,
  description,
  githubLogin,
}: BountyDistribution) {
  function verifyAmount(): boolean {
    return amounts.length > 1 && BigNumber(amounts[1]).gt(0);
  }

  return (
    <>
      <li
        className="d-flex align-items-center bg-gray-850 px-3 py-2"
        key={name}
      >
        <div className="d-flex flex-grow-1 flex-column">
          <div className="text-gray label-m d-flex align-items-center gap-2 mb-1">
            {githubLogin ? <Avatar key={githubLogin}  size="xsm"  userLogin={githubLogin} tooltip /> : null}
            <label className="text-truncate text-uppercase">
              {name}
            </label>
            {description && (
              <InfoTooltip description={description} secondaryIcon={true} />
            )}

          </div>
          {verifyAmount() && (
            <span className="caption-small text-light-gray">{name}</span>
          )}
        </div>
        
        <div className={"d-flex flex-shrink-0 w-40 flex-column"}>
          <div className="d-flex align-items-center gap-2 justify-content-end">
            <span className="text-gray label-m">
              {percentage}%
            </span>
            
            <ArrowRight color="text-gray" width={14}/>

            <span className="caption-medium text-white">
              {formatNumberToNScale(amounts[0])}{" "}

              <label className="ps-1 pt-1 caption-small text-uppercase text-primary">
              {symbols[0]}
            </label>
            </span>
            
          </div>

          {verifyAmount() && (
            <div className="d-flex justify-content-end">
              <span className="caption-small text-light-gray">
                {amounts[1]}{" "}
                <label className="ps-1 caption-small text-uppercase text-light-gray">
                  {symbols[1]}
                </label>
              </span>
            </div>
          )}
        </div>
      </li>
    </>
  );
}
