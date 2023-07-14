import Avatar from "components/avatar";
import If from "components/If";
import InfoTooltip from "components/info-tooltip";

import { formatNumberToString } from "helpers/formatNumber";

export default function DistributionBarItem({
  percentage,
  githubLogin = null,
  label = "",
  description = "",
  progressColor = "primary",
}) {
  return (
    <div
      className="rounded-bottom d-flex flex-column align-self-end align-items-center gap-2 min-w-fit"
      style={{ width: `${percentage || 25}%` }}
    >
      <If
        condition={!!githubLogin}
        otherwise={
          <span className="text-gray-500 text-uppercase xs-medium mt-1">
            {label}
          </span>
        }
      >
        <Avatar key={githubLogin} userLogin={githubLogin} tooltip />
      </If>

      <div className="d-flex gap-1">
        <span className="caption-small">
          {formatNumberToString(percentage, 2)}%
        </span>

        <If condition={!!description}>
          <InfoTooltip description={description} secondaryIcon={true} />
        </If>
      </div>

      <span className={`w-100 bg-${progressColor} p-1 rounded`} />
    </div>
  );
}
