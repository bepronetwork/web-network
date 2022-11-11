import BigNumber from "bignumber.js";

import Translation from "components/translation";

import { formatNumberToNScale } from "helpers/formatNumber";

interface Options {
  pgClass: string;
  value: BigNumber;
  total: BigNumber;
  textClass: string;
}

export default function ProposalProgressSmall({
  pgClass = "",
  value = BigNumber(0),
  total = BigNumber(0),
  textClass
}: Options) {
  const dotStyle = { width: "10px", height: "10px" };

  function toRepresentationPercent(value = 0, total = 5) {
    return (value * 100) / total;
  }

  const percent = BigNumber(value.multipliedBy(100).toFixed(2,1) || 0).dividedBy(total);

  return (
    <div className="text-center position-relative d-inline-block col">
      <div className={"caption-small mb-1"}>
        <span className={textClass}>{formatNumberToNScale(value.toFixed(0 , 1))}</span>
        <span>
          /{formatNumberToNScale(total.toFixed(0, 1))} <Translation label={"oracles"} />
        </span>
      </div>
      <div className={"progress bg-gray w-100 mb-1"}>
        <div className={`wrapper wrapper-${pgClass} w-100`} />
        <div
          className={`progress-bar bg-${pgClass}`}
          role="progressbar"
          style={{ width: `${toRepresentationPercent(+percent, 3)}%` }}
        >
          <div
            style={{ ...dotStyle, left: 0 }}
            className={`rounded-circle position-absolute ${
              percent.gt(0)? `bg-${pgClass}` : "empty-dot"
            }`}
          />
          <div
            style={{ ...dotStyle, right: 0 }}
            className={`rounded-circle position-absolute ${
              percent.gte(3) ? `bg-${pgClass}` : "empty-dot"
            }`}
          />
        </div>
      </div>
      <div className={`caption-small ${textClass}`}>{percent.toFixed(0 , 1)}%</div>
    </div>
  );
}
