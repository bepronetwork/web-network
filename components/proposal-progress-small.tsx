import BigNumber from "bignumber.js";

import { useAppState } from "contexts/app-state";

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
  const {state} = useAppState()
  const dotStyle = { width: "4px", height: "14px" };

  const disputePercentage = +state.Service?.network.amounts.percentageNeededForDispute || 5;

  function toRepresentationPercent(value = 0, total = 5) {
    return (value * 100) / total;
  }

  const percent = BigNumber(value.multipliedBy(100).toFixed(2,1) || 0).dividedBy(total);

  return (
    <div className="text-center position-relative d-inline-flex flex-column w-100">
      <div className="mb-1">
        <span className="label-m text-gray-100">
          <strong className={`text-${color}`}>{formatNumberToNScale(value.toFixed(0 , 1))} </strong>
           OF {formatNumberToNScale(total.toFixed(0, 1))}
        </span>
      </div>
      <div className={"progress w-100 mb-1"}>
        <div
          className={`progress-bar bg-${color}`}
          role="progressbar"
          style={{ width: `${toRepresentationPercent(+percent, disputePercentage) - 15}%` }}
        >
          <div
            style={{ ...dotStyle, right: 22}}
            className={`position-absolute ${
              percent.gte(disputePercentage) ? `bg-${color}` : "bg-gray-700"
            }`}
          />
        </div>
      </div>
    </div>
  );
}
