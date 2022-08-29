import React, { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";

import { isProposalDisputable } from "helpers/proposal";

import { ProposalExtended } from "interfaces/bounty";
import { pullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import Button from "./button";
import ProposalMerge from "./proposal-merge";
import ProposalProgressBar from "./proposal-progress-bar";

interface IProposalActionCardProps {
  proposal: Proposal;
  networkProposal: ProposalExtended;
  currentPullRequest: pullRequest;
  onMerge: () => Promise<void>;
  onDispute: () => Promise<void>;
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
  
  const [isMerging, setIsMerging] = useState(false);
  const [isRefusing, setIsRefusing] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);
  const [chaintime, setChainTime] = useState<number>();

  const { activeNetwork } = useNetwork();
  const { wallet } = useAuthentication();
  const { service: DAOService } = useDAO();
  const { networkIssue, activeIssue } = useIssue();


  const isDisable = () => [
    networkIssue?.closed,
    !isProposalDisputable(proposal?.createdAt, activeNetwork?.disputableTime, chaintime),
    networkProposal?.isDisputed,
    networkProposal?.refusedByBountyOwner,
    !networkProposal?.canUserDispute,
    wallet?.balance?.oracles?.locked === 0,
    isMerging,
    isRefusing
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
    !isProposalDisputable(proposal?.createdAt, activeNetwork?.disputableTime),
    !isMerging,
    !isRefusing,
    !isDisputing
  ].every(v => v);

  function handleRefuse() {
    setIsRefusing(true);
    onRefuse().finally(() => setIsRefusing(false));
  }

  function handleDispute() {
    setIsDisputing(true);
    onDispute().finally(() => setIsDisputing(false));
  }

  function handleMerge() {
    setIsMerging(true);
    onMerge().finally(() => setIsMerging(false));
  }

  useEffect(() => {
    if (DAOService)
      DAOService.getTimeChain().then(setChainTime);
  }, [DAOService]);

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

            <ProposalMerge 
              amountTotal={Math.max(activeIssue?.amount || 0, activeIssue?.fundingAmount || 0)} 
              tokenSymbol={activeIssue?.token?.symbol} 
              proposal={networkProposal}
              isMerging={isMerging}
              idBounty={activeIssue?.id} 
              onClickMerge={handleMerge}
              canMerge={!canMerge()}
            />

            {!isSuccess() && !isDisable() && (
              <Button
                className="flex-grow-1"
                textClass="text-uppercase text-white"
                color="purple"
                disabled={isDisable() || isDisputing}
                onClick={handleDispute}
                isLoading={isDisputing}
                withLockIcon={isDisable()}
              >
                {t("actions.dispute")}
              </Button>
            )}

            {isRefusable() && (
              <Button
                className="flex-grow-1"
                textClass="text-uppercase text-white"
                color="danger"
                disabled={!isRefusable() || isRefusing || isDisputing || isMerging}
                onClick={handleRefuse}
                isLoading={isRefusing}
                withLockIcon={isDisputing || isMerging}
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
