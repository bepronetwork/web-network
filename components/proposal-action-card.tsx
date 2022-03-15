import React from "react";
import { useTranslation } from "next-i18next";
import { INetworkProposal, Proposal } from "@interfaces/proposal";
import ProposalProgressBar from "./proposal-progress-bar";
import Button from "./button";
import { useIssue } from "@contexts/issue";

interface IProposalActionCardProps {
  proposal: Proposal;
  networkProposal: INetworkProposal;
  onMerge: () => void;
  onDispute: () => void;
}

export default function ProposalActionCard({
  proposal,
  networkProposal,
  onMerge,
  onDispute,
}: IProposalActionCardProps) {
  const { t } = useTranslation("proposal");
  const { networkIssue } = useIssue();

  return (
    <div className="col-md-6">
      <div className="bg-shadow rounded-5 p-3">
        <div className="mb-5">
          <ProposalProgressBar
            issueDisputeAmount={100}
            isDisputed={networkProposal?.isDisputed}
            isFinished={networkIssue?.finalized}
            isCurrentPRMerged={proposal?.isMerged}
          />
        </div>
        <div className="d-flex flex-row justify-content-between mt-2 py-2">
          <Button
            className="btn-lg"
            textClass="text-uppercase text-white"
            onClick={onMerge}
          >
            {t("actions.merge")}
          </Button>
          <Button
            className="btn-lg"
            textClass="text-uppercase text-white"
            color="purple"
            onClick={onDispute}
          >
            {t("actions.dispute")}
          </Button>
        </div>
      </div>
    </div>
  );
}
