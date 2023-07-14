import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";

import { useAppState } from "contexts/app-state";

import { NetworkEvents } from "interfaces/enums/events";
import { IssueBigNumberData, IssueData } from "interfaces/issue-data";
import { DistributedAmounts, Proposal } from "interfaces/proposal";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useContractTransaction from "x-hooks/use-contract-transaction";
import useRefresh from "x-hooks/use-refresh";

import ProposalActionsButtonsView from "./view";

interface ProposalActionsButtonsProps {
  issue: IssueData | IssueBigNumberData;
  proposal: Proposal;
  onlyMerge?: boolean;
  distributedAmounts: DistributedAmounts;
  isUserAbleToDispute: boolean;
  isRefusable: boolean;
  isDisputable: boolean;
  isMergeable: boolean;
}

export default function ProposalActionsButtons({
  issue,
  proposal,
  onlyMerge,
  distributedAmounts,
  isUserAbleToDispute,
  isRefusable,
  isDisputable,
  isMergeable,
}: ProposalActionsButtonsProps) {
  const { t } = useTranslation(["common", "proposal"]);

  const { createNFT } = useApi();
  const { state } = useAppState();
  const { refresh } = useRefresh();
  const { handlerDisputeProposal, handleCloseIssue, handleRefuseByOwner } = useBepro();

  const [isMerging, onMerge, setIsMerging] = useContractTransaction(NetworkEvents.BountyClosed,
                                                                    handleCloseIssue,
                                                                    t("modals.not-mergeable.success-message"),
                                                                    t("errors.something-went-wrong"));
  const [isDisputing, onDispute] = useContractTransaction(NetworkEvents.ProposalDisputed,
                                                          handlerDisputeProposal,
                                                          t("proposal:messages.proposal-disputed"),
                                                          t("errors.something-went-wrong"));
  const [isRefusing, onRefuse] = useContractTransaction(NetworkEvents.ProposalRefused,
                                                        handleRefuseByOwner,
                                                        t("proposal:messages.proposal-refused"),
                                                        t("errors.something-went-wrong"));

  async function handleRefuse() {
    try {
      await onRefuse(+issue?.contractId, +proposal.contractId);

      refresh();
    } catch (error) {
      console.debug("Failed to refuse proposal", error);
    }
  }

  async function handleDispute() {
    try {
      await onDispute(+issue?.contractId, +proposal.contractId);

      refresh();
    } catch (error) {
      console.debug("Failed to dispute proposal", error);
    }
  }

  async function handleMerge() {
    try {
      setIsMerging(true);
      
      const { url } = await createNFT(issue?.contractId,
                                      proposal.contractId,
                                      state.currentUser?.walletAddress);

      await onMerge(+issue?.contractId, +proposal.contractId, url);

      refresh();
    } catch (error) {
      console.debug("Failed to close bounty", error);
    }
  }

  return(
    <ProposalActionsButtonsView
      proposal={proposal}
      issueAmount={BigNumber(issue?.amount || issue?.fundingAmount || 0)}
      issueDbId={issue?.id}
      transactionalTokenSymbol={issue?.transactionalToken?.symbol}
      isAbleToMerge={isMergeable}
      isAbleToDispute={isDisputable && isUserAbleToDispute}
      isAbleToRefuse={isRefusable}
      isMerging={isMerging}
      isDisputing={isDisputing}
      isRefusing={isRefusing}
      onlyMerge={onlyMerge}
      distributedAmounts={distributedAmounts}
      onMerge={handleMerge}
      onDispute={handleDispute}
      onRefuse={handleRefuse}
    />
  );
}