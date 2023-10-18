import React from "react";

import { useTranslation } from "next-i18next";

import DistributionBarItem from "components/proposal/distribution/bar/item/view";

import { DistributedAmounts } from "interfaces/proposal";

interface DistributionBarProps {
  distributedAmounts: DistributedAmounts;
}

export default function DistributionBar({
  distributedAmounts,
}: DistributionBarProps) {
  const { t } = useTranslation(["common", "proposal"]);

  const treasury = distributedAmounts?.treasuryAmount || { percentage: 0 };
  const merge = distributedAmounts?.mergerAmount || { percentage: 0 };
  const proposer = distributedAmounts?.proposerAmount || { percentage: 0 };
  const proposals = distributedAmounts?.proposals || [{ percentage: 0 }];

  const items = [
    ...proposals,
    {
      ...proposer,
      progressColor: "purple",
      label: t("proposal:merge-modal.proposal-creator"),
      description: t("proposal:merge-modal.proposal-creator-description"),
    },
    {
      ...merge,
      progressColor: "gray-700",
      label: t("proposal:merge-modal.proposal-accepter"),
      description: t("proposal:merge-modal.proposal-accepter-description"),
    },
    {
      ...treasury,
      progressColor: "white",
      label: t("proposal:merge-modal.network-fee"),
      description: t("proposal:merge-modal.network-fee-description", {
        percentage: distributedAmounts?.treasuryAmount?.percentage,
      }),
    },
  ];

  return (
    <div className="row">
      <div className="col-12">
        <div className="d-flex justify-content-center align-items-center gap-1">
          {items.map((item, index) => (
            <DistributionBarItem key={`distribution-${index}`} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
}
