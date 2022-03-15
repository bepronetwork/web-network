import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { INetworkProposal, Proposal } from "@interfaces/proposal";
import ProposalProgressBar from "./proposal-progress-bar";
import Button from "./button";
import { useIssue } from "@contexts/issue";
import { pullRequest } from "@interfaces/issue-data";
import { isProposalDisputable } from "helpers/proposal";
import { BeproService } from "@services/bepro-service";

interface IProposalActionCardProps {
  proposal: Proposal;
  networkProposal: INetworkProposal;
  currentPullRequest: pullRequest;
  onMerge: () => void;
  onDispute: () => void;
}

export default function ProposalActionCard({
  proposal,
  networkProposal,
  onMerge,
  onDispute,
}: IProposalActionCardProps) {
  const [disputableTime, setDisputableTime] = useState(0);
  const { t } = useTranslation("common");
  
  const { networkIssue } = useIssue();
  // const canMerge = [(mergeable && mergeable_state === 'clean')].redunce()

  const isDisputable = isProposalDisputable(proposal?.createdAt, disputableTime)


  useEffect(() => {
    BeproService.getDisputableTime().then(setDisputableTime);
  }, [proposal, networkIssue]);

  return (
    <div className="col-md-6">
      <div className="bg-shadow rounded-5 p-3">
        <div className="mb-5">
          <ProposalProgressBar
            issueDisputeAmount={+networkProposal?.disputes}
            isDisputed={networkProposal?.isDisputed}
            isFinished={networkIssue?.finalized}
            isCurrentPRMerged={proposal?.isMerged}
          />
        </div>
        <div className="d-flex flex-row justify-content-between mt-2 py-2">
          <Button
            className="btn-lg"
            textClass="text-uppercase text-white"
            disabled={isDisputable}
            onClick={onMerge}
          >
            {t("actions.merge")}
          </Button>
          <Button
            className="btn-lg"
            textClass="text-uppercase text-white"
            color="purple"
            disabled={!isDisputable}
            onClick={onDispute}
          >
            {t("actions.dispute")}
          </Button>
        </div>
      </div>
    </div>
  );
}
