import React, {useEffect, useState} from "react";

import BigNumber from "bignumber.js";
import {addSeconds, formatDistance} from "date-fns";
import {useTranslation} from "next-i18next";

import Button from "components/button";
import {ContextualSpan} from "components/contextual-span";
import ProposalMerge from "components/proposal-merge";
import ProposalProgressBar from "components/proposal-progress-bar";

import {useAppState} from "contexts/app-state";

import {isProposalDisputable} from "helpers/proposal";

import {ProposalExtended} from "interfaces/bounty";
import {pullRequest} from "interfaces/issue-data";
import {DistributedAmounts, Proposal} from "interfaces/proposal";

import useOctokit from "x-hooks/use-octokit";

interface IProposalActionCardProps {
  proposal: Proposal;
  networkProposal: ProposalExtended;
  currentPullRequest: pullRequest;
  distributedAmounts: DistributedAmounts;
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
  onRefuse,
  distributedAmounts
}: IProposalActionCardProps) {
  const { t } = useTranslation(["common", "pull-request", "proposal"]);
  
  const [isMerging, setIsMerging] = useState(false);
  const [isRefusing, setIsRefusing] = useState(false);
  const [chaintime, setChainTime] = useState<number>();
  const [isDisputing, setIsDisputing] = useState(false);
  const [allowMergeCommit, setAllowMergeCommit] = useState<boolean>();
  const [chainDisputable, setChainDisputable] = useState<boolean>(false);
  const [missingDisputableTime, setMissingDisputableTime] = useState<string>('');

  const {getRepository} = useOctokit();
  const {state} = useAppState();

  const bountyAmount = 
    BigNumber.maximum(state.currentBounty?.data?.amount || 0, state.currentBounty?.data?.fundingAmount || 0);
  const branchProtectionRules = state.Service?.network?.repos?.active?.branchProtectionRules;
  const approvalsRequired = 
    branchProtectionRules ? 
      branchProtectionRules[state.currentBounty?.data?.branch]?.requiredApprovingReviewCount || 0 : 0;
  const approvalsCurrentPr = currentPullRequest?.approvals?.total || 0;
  const prsNeedsApproval = approvalsCurrentPr < approvalsRequired;

  const proposalCanBeDisputed = () => [
    isProposalDisputable(proposal?.createdAt, 
                         BigNumber(state.Service?.network.times?.disputableTime).toNumber(),
                         chaintime),
    networkProposal?.canUserDispute,
    !proposal?.isDisputed,
    !proposal?.refusedByBountyOwner,
    !state.currentBounty?.chainData?.closed,
    !proposal?.isDisputed,
    !proposal?.isMerged
  ].every(c => c);

  const isRefusable = () => [
    !state.currentBounty?.chainData?.closed,
    !state.currentBounty?.chainData?.canceled,
    !proposal?.isDisputed,
    !proposal?.refusedByBountyOwner,
    state.currentBounty?.chainData?.creator === state.currentUser?.walletAddress
  ].every(v => v);

  const canMerge = () => [
    currentPullRequest?.isMergeable,
    !proposal?.isMerged,
    !proposal?.isDisputed,
    !proposal?.refusedByBountyOwner,
    !isProposalDisputable(proposal?.createdAt, BigNumber(state.Service?.network.times?.disputableTime).toNumber()),
    !isMerging,
    !isRefusing,
    !isDisputing,
    allowMergeCommit === true,
    !prsNeedsApproval
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

  function changeMissingDisputableTime() {
    if (!chaintime || !state.Service?.network?.times?.disputableTime || !proposal)
      return;

    const target = addSeconds(new Date(proposal?.createdAt), +state.Service?.network.times.disputableTime);
    const missingTime = formatDistance(new Date(chaintime), target, {includeSeconds: true});

    setMissingDisputableTime(missingTime);
    setChainDisputable(+target - +new Date(chaintime) > 0);
  }

  useEffect(changeMissingDisputableTime, [
    proposal?.createdAt, 
    chaintime, 
    state.Service?.network?.times?.disputableTime
  ]);

  useEffect(() => {
    if (state.Service?.active)
      state.Service?.active.getTimeChain().then(setChainTime);
  }, [state.Service?.active]);

  useEffect(() => {
    if (state.currentBounty?.data?.repository?.githubPath)
      getRepository(state.currentBounty?.data?.repository?.githubPath)
        .then(({ mergeCommitAllowed }) => setAllowMergeCommit(mergeCommitAllowed))
        .catch(console.debug);
  }, [state?.currentBounty?.data]);

  return (
    <div className="col-md-6">
      <div className="bg-shadow rounded-5 p-3">
        <div className="mb-5">
          <ProposalProgressBar
            issueDisputeAmount={proposal?.disputeWeight?.toNumber()}
            disputeMaxAmount={+state.Service?.network?.amounts?.percentageNeededForDispute || 0}
            isDisputed={proposal?.isDisputed}
            isFinished={state.currentBounty?.chainData?.closed}
            isMerged={proposal?.isMerged}
            refused={proposal?.refusedByBountyOwner}
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
              amountTotal={bountyAmount} 
              tokenSymbol={state.currentBounty?.data?.token?.symbol}
              proposal={proposal}
              isMerging={isMerging}
              idBounty={state.currentBounty?.data?.id}
              onClickMerge={handleMerge}
              canMerge={canMerge()}
              distributedAmounts={distributedAmounts}
            />

            {proposalCanBeDisputed() && (
              <Button
                className="flex-grow-1"
                textClass="text-uppercase text-white"
                color="purple"
                disabled={!proposalCanBeDisputed() || isDisputing}
                onClick={handleDispute}
                isLoading={isDisputing}
                withLockIcon={!proposalCanBeDisputed() || isMerging || isRefusing}
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

          {
            chainDisputable &&
            <div className="row mt-2">
              <ContextualSpan context="warning">
                {t('proposal:messages.in-disputable-time', {time: missingDisputableTime})}
              </ContextualSpan>
            </div> || ""
          }

          { allowMergeCommit === false &&
            <div className="row mt-2">
              <ContextualSpan context="warning">
                {t("pull-request:errors.merge-commit")}
              </ContextualSpan>
            </div>
          }

          { prsNeedsApproval &&
            <div className="row mt-2">
              <ContextualSpan context="warning">
                {t("pull-request:errors.approval")}
              </ContextualSpan>
            </div>
          }
        </div>
      </div>
    </div>
  );
}
