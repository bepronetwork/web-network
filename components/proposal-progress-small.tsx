import BigNumber from "bignumber.js";

import { formatNumberToNScale } from "helpers/formatNumber";

interface Options {
  value: BigNumber;
  total: BigNumber;
  color?: 'purple' | 'danger' | 'success';
}

export default function ProposalProgressSmall({
  value = BigNumber(0),
  total = BigNumber(0),
  color = 'purple'
}: Options) {
  const dotStyle = { width: "4px", height: "14px" };

  const percent = value.multipliedBy(100).dividedBy(total).toNumber();

  return (
    <div className="text-center position-relative d-inline-flex flex-column w-100">
      <div className="mb-1">
        <span className="label-m text-gray-100">
          <strong className={`text-${color}`}>{formatNumberToNScale(+value)} </strong>
           OF {formatNumberToNScale(total.toFixed(0, 1))}
        </span>
      </div>
      <div className={"progress w-100 mb-1"}>
        <div
          className={`progress-bar bg-${color}`}
          role="progressbar"
          style={{ width: `${percent}%` }}
        >
          <div
            style={{ ...dotStyle, right: 22}}
            className={`position-absolute ${
              value.gte(total) ? `bg-${color}` : "bg-gray-700"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
