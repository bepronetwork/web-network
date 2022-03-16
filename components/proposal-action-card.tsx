import React, { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { INetworkProposal, Proposal } from "@interfaces/proposal";
import ProposalProgressBar from "./proposal-progress-bar";
import Button from "./button";
import { useIssue } from "contexts/issue";
import { pullRequest } from "interfaces/issue-data";
import { isProposalDisputable } from "helpers/proposal";
import { BeproService } from "services/bepro-service";
import LockedIcon from "assets/icons/locked-icon";

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
  currentPullRequest,
  onMerge,
  onDispute,
}: IProposalActionCardProps) {
  const [disputableTime, setDisputableTime] = useState(0);
  const { t } = useTranslation(['common', 'pull-request']);
  const { networkIssue } = useIssue();

  const isDisputable = [
    !networkProposal?.isDisputed,
    !networkIssue?.finalized,
    isProposalDisputable(proposal?.createdAt, disputableTime),
  ].every((v) => v);
  const isSuccess = [
    networkIssue?.finalized,
    !networkProposal?.isDisputed && proposal?.isMerged,
  ].every((v) => v);

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
            isMerged={proposal?.isMerged}
          />
        </div>
        <div className="mt-2 py-2 text-center">
          {!currentPullRequest?.isMergeable && !proposal?.isMerged && (
            <span className="text-uppercase text-danger caption-small">{t('pull-request:errors.merge-conflicts')}</span>
          )}
          <div className="d-flex flex-row justify-content-between mt-3">
            <Button
              className="flex-grow-1"
              textClass="text-uppercase text-white"
              disabled={!currentPullRequest?.isMergeable || proposal?.isMerged}
              onClick={onMerge}
            >
              {!currentPullRequest?.isMergeable ||
                (proposal?.isMerged && (
                  <LockedIcon width={12} height={12} className="mr-1" />
                ))}
              {t("common:actions.merge")}
            </Button>

            {!isSuccess && isDisputable && (
              <Button
                className="flex-grow-1"
                textClass="text-uppercase text-white"
                color="purple"
                disabled={!isDisputable}
                onClick={onDispute}
              >
                {t("common:actions.dispute")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
