import React, { useState } from "react";

import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import { useAuthentication } from "contexts/authentication";
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";

import { isProposalDisputable } from "helpers/proposal";

import { ProposalExtended } from "interfaces/bounty";
import { pullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import Button from "./button";
import ProposalProgressBar from "./proposal-progress-bar";

interface IProposalActionCardProps {
  proposal: Proposal;
  networkProposal: ProposalExtended;
  currentPullRequest: pullRequest;
  onMerge: () => void;
  onDispute: () => void;
  onRefuse: () => Promise<void>;
}

export default function ProposalActionCard({
  proposal,
  networkProposal,
  currentPullRequest,
  onMerge,
  onDispute,
  onRefuse
}: IProposalActionCardProps) {
  const { t } = useTranslation(["common", "pull-request"]);
  const { networkIssue } = useIssue();
  const { activeNetwork } = useNetwork();
  const { wallet } = useAuthentication();

  const [isRefusing, setIsRefusing] = useState(false);

  const isDisable = () => [
    networkIssue?.closed,
    !isProposalDisputable(proposal?.createdAt, activeNetwork?.disputableTime),
    networkProposal?.isDisputed,
    !networkProposal?.canUserDispute,
    wallet?.balance?.oracles?.locked === 0,
  ].some((v) => v);

  const isSuccess =  () => [
    networkIssue?.closed,
    !networkProposal?.isDisputed && proposal?.isMerged
  ].every((v) => v);

  const isRefusable = () => [
    !networkIssue?.closed,
    !networkIssue?.canceled,
    !networkProposal?.isDisputed,
    !networkProposal?.refusedByBountyOwner,
    networkIssue?.creator === wallet?.address
  ].every(v => v);

  const canMerge = () => [
    currentPullRequest?.isMergeable,
    !proposal?.isMerged,
    !networkProposal?.isDisputed,
    !networkProposal?.refusedByBountyOwner,
    !isProposalDisputable(proposal?.createdAt, activeNetwork?.disputableTime)
  ].every(v => v);

  function handleRefuse() {
    setIsRefusing(true);
    onRefuse().finally(() => setIsRefusing(false));
  }

  return (
    <div className="col-md-6">
      <div className="bg-shadow rounded-5 p-3">
        <div className="mb-5">
          <ProposalProgressBar
            issueDisputeAmount={+networkProposal?.disputeWeight}
            isDisputed={networkProposal?.isDisputed}
            isFinished={networkIssue?.closed}
            isMerged={proposal?.isMerged}
            refused={networkProposal?.refusedByBountyOwner}
          />
        </div>
        <div className="mt-2 py-2 text-center">
          {!currentPullRequest?.isMergeable && !proposal?.isMerged && (
            <span className="text-uppercase text-danger caption-small">
              {t("pull-request:errors.merge-conflicts")}
            </span>
          )}
          <div className="d-flex flex-row justify-content-between mt-3">
            <Button
              className="flex-grow-1"
              textClass="text-uppercase text-white"
              disabled={!canMerge()}
              onClick={onMerge}
            >
              {!canMerge() && (
                  <LockedIcon width={12} height={12} className="mr-1" />
                )}
              <span>{t("actions.merge")}</span>
            </Button>

              {!isSuccess() && !isDisable() && (
                <Button
                  className="flex-grow-1"
                  textClass="text-uppercase text-white"
                  color="purple"
                  disabled={isDisable()}
                  onClick={onDispute}
                >
                  {t("actions.dispute")}
                </Button>
              )}

              {isRefusable() && (
                <Button
                  className="flex-grow-1"
                  textClass="text-uppercase text-white"
                  color="purple"
                  disabled={!isRefusable() || isRefusing}
                  onClick={handleRefuse}
                >
                  {t("actions.refuse")}
                </Button>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
