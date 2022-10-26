import React, {useContext, useEffect, useState} from "react";
import Button from "components/button";
import ProposalMerge from "components/proposal-merge";
import ProposalProgressBar from "components/proposal-progress-bar";
import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import { isProposalDisputable } from "helpers/proposal";

import { ProposalExtended } from "interfaces/bounty";
import { pullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import {AppStateContext} from "../contexts/app-state";
import useOctokit from "x-hooks/use-octokit";

import { ContextualSpan } from "./contextual-span";

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
  const [chaintime, setChainTime] = useState<number>();
  const [isDisputing, setIsDisputing] = useState(false);
  const [allowMergeCommit, setAllowMergeCommit] = useState<boolean>();

  const {state} = useContext(AppStateContext);

  const bountyAmount = BigNumber.maximum(state.currentBounty?.data?.amount || 0, state.currentBounty?.data?.fundingAmount || 0);

  const isDisable = () => [
    state.currentBounty?.chainData?.closed,
    !isProposalDisputable(proposal?.createdAt, state.Service?.network?.active?.disputableTime, chaintime),
    networkProposal?.isDisputed,
    networkProposal?.refusedByBountyOwner,
    !networkProposal?.canUserDispute,
    state.currentUser?.balance?.oracles?.locked?.isZero(),
    isMerging,
    isRefusing
  ].some((v) => v);

  const isSuccess =  () => [
    state.currentBounty?.chainData?.closed,
    !networkProposal?.isDisputed && proposal?.isMerged
  ].every((v) => v);

  const isRefusable = () => [
    !state.currentBounty?.chainData?.closed,
    !state.currentBounty?.chainData?.canceled,
    !networkProposal?.isDisputed,
    !networkProposal?.refusedByBountyOwner,
    state.currentBounty?.chainData?.creator === state.currentUser?.walletAddress
  ].every(v => v);

  const canMerge = () => [
    currentPullRequest?.isMergeable,
    !proposal?.isMerged,
    !networkProposal?.isDisputed,
    !networkProposal?.refusedByBountyOwner,
    !isProposalDisputable(proposal?.createdAt, state.Service?.network?.active?.disputableTime),
    !isMerging,
    !isRefusing,
    !isDisputing,
    allowMergeCommit === true
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
    if (state.Service?.active)
      state.Service?.active.getTimeChain().then(setChainTime);
  }, [state.Service?.active]);

  useEffect(() => {
    if (activeIssue?.repository?.githubPath)
      getRepository(activeIssue?.repository?.githubPath)
        .then(({ mergeCommitAllowed }) => setAllowMergeCommit(mergeCommitAllowed))
        .catch(console.debug);
  }, [activeIssue]);

  return (
    <div className="col-md-6">
      <div className="bg-shadow rounded-5 p-3">
        <div className="mb-5">
          <ProposalProgressBar
            issueDisputeAmount={+networkProposal?.disputeWeight}
            isDisputed={networkProposal?.isDisputed}
            isFinished={state.currentBounty?.chainData?.closed}
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
              amountTotal={bountyAmount} 
              tokenSymbol={state.currentBounty?.data?.token?.symbol}
              proposal={networkProposal}
              isMerging={isMerging}
              idBounty={state.currentBounty?.data?.id}
              onClickMerge={handleMerge}
              canMerge={canMerge()}
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

          { allowMergeCommit === false &&
            <div className="row mt-2">
              <ContextualSpan context="warning">
                {t("pull-request:errors.merge-commit")}
              </ContextualSpan>
            </div>
          }
        </div>
      </div>
    </div>
  );
}
