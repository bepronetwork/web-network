import React from "react";

import { useTranslation } from "next-i18next";

import { formatNumberToString } from "helpers/formatNumber";

import { DistributedAmounts } from "interfaces/proposal";


import Avatar from "./avatar";

interface IProposalProgressProps {
  distributedAmounts: DistributedAmounts;
}


function ProgressItem({percentage, githubLogin = null, label = '', description = ''}){
  return(
    <div
    className={
      "rounded-bottom d-flex flex-column align-items-center gap-2"
    }
    style={{ width: `${percentage}%` }}
  >
    {githubLogin ? <Avatar key={githubLogin} userLogin={githubLogin} tooltip /> : (
      <div>
        <span>{label}</span>
      </div>
    )}

    <p className="caption-small">
      {formatNumberToString(percentage, 0)}%
    </p>

    <span className="w-100 bg-primary p-1 rounded" />
  </div>
  )
}

export default function ProposalProgress({distributedAmounts}: IProposalProgressProps) {
  const { t } = useTranslation(["common", "proposal"]);
  const treasury = distributedAmounts.treasuryAmount;
  const merge = distributedAmounts.mergerAmount;
  const proposer = distributedAmounts.proposerAmount;
  const proposals = distributedAmounts.proposals;

  return (
    <div className="container bg-shadow p-2">
      <div className="d-flex justify-content-center align-items-center gap-2">
        {proposals?.length &&
          React.Children.toArray(proposals.map((item, index) => 
            <ProgressItem key={`user_${index}`} percentage={item.percentage} githubLogin={item?.githubLogin}/>))}

        <ProgressItem 
          percentage={treasury.percentage} 
          label={t("proposal:merge-modal.network-fee")}
          description={t("proposal:merge-modal.network-fee-description", {
          percentage: distributedAmounts.treasuryAmount.percentage,
          })}/>
        <ProgressItem 
          percentage={merge.percentage}
          label={t("proposal:merge-modal.proposal-merger")}
          description={t("proposal:merge-modal.proposal-merger-description")} />
        <ProgressItem 
          percentage={proposer.percentage} 
          label={t("proposal:merge-modal.proposal-creator")}
          description={t("proposal:merge-modal.proposal-creator-description")} />
      </div>
    </div>
  );
}
