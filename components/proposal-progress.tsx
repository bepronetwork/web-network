import React from "react";

import { useTranslation } from "next-i18next";

import Avatar from "components/avatar";
import InfoTooltip from "components/info-tooltip";

import { formatNumberToString } from "helpers/formatNumber";

import { DistributedAmounts } from "interfaces/proposal";

interface IProposalProgressProps {
  distributedAmounts: DistributedAmounts;
}

function ProgressItem({
  percentage,
  githubLogin = null,
  label = "",
  description = "",
  progressColor = "primary",
}) {
  return (
    <div
      className={
        "rounded-bottom d-flex flex-column align-self-end align-items-center gap-2 min-w-fit"
      }
      style={{ width: `${percentage}%` }}
    >
      {githubLogin ? (
        <Avatar key={githubLogin} userLogin={githubLogin} tooltip />
      ) : (
        <span className="text-gray-500 text-uppercase xs-small mt-1">
          {label}
        </span>
      )}

      <div>
        <span className="caption-small mr-1">
          {formatNumberToString(percentage, 2)}%
        </span>
        {description && (
          <InfoTooltip description={description} secondaryIcon={true} />
        )}
      </div>

      <span className={`w-100 bg-${progressColor} p-1 rounded`} />
    </div>
  );
}

export default function ProposalProgress({
  distributedAmounts,
}: IProposalProgressProps) {
  const { t } = useTranslation(["common", "proposal"]);
  const treasury = distributedAmounts.treasuryAmount;
  const merge = distributedAmounts.mergerAmount;
  const proposer = distributedAmounts.proposerAmount;
  const proposals = distributedAmounts.proposals;

  return (
    <div className="container bg-shadow p-2">
      <div className="d-flex justify-content-center align-items-center gap-1">
        {proposals?.length &&
          React.Children.toArray(proposals.map((item, index) => (
              <ProgressItem
                key={`user_${index}`}
                percentage={item.percentage}
                githubLogin={item?.githubLogin}
              />
            )))}

        <ProgressItem
          percentage={proposer.percentage}
          progressColor="purple"
          label={t("proposal:merge-modal.proposal-creator")}
          description={t("proposal:merge-modal.proposal-creator-description")}
        />

        <ProgressItem
          percentage={merge.percentage}
          label={t("proposal:merge-modal.proposal-merger")}
          progressColor="gray-700"
          description={t("proposal:merge-modal.proposal-merger-description")}
        />

        <ProgressItem
          percentage={treasury.percentage}
          label={t("proposal:merge-modal.network-fee")}
          progressColor="white"
          description={t("proposal:merge-modal.network-fee-description", {
            percentage: distributedAmounts.treasuryAmount.percentage,
          })}
        />
      </div>
    </div>
  );
}
