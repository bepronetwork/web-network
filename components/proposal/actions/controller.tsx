import { useTranslation } from "next-i18next";

import ProposalActionsView from "components/proposal/actions/view";

import { useAppState } from "contexts/app-state";

import {
  IssueBigNumberData,
  IssueData,
  PullRequest,
} from "interfaces/issue-data";
import { DistributedAmounts, Proposal } from "interfaces/proposal";

interface ProposalActionsProps {
  proposal: Proposal;
  issue: IssueData | IssueBigNumberData;
  pullRequest: PullRequest;
  distributedAmounts: DistributedAmounts;
  isUserAbleToDispute: boolean;
  isDisputableOnChain: boolean;
  missingDisputableTime: string;
  isDisputable: boolean;
  isRefusable: boolean;
  isMergeable: boolean;
  allowMergeCommit: boolean;
  isPrOwner: boolean;
  isProposalOwner: boolean;
  prsNeedsApproval: boolean;
}

export default function ProposalActions({
  proposal,
  issue,
  pullRequest,
  distributedAmounts,
  isUserAbleToDispute,
  isDisputableOnChain,
  missingDisputableTime,
  isDisputable,
  isRefusable,
  isMergeable,
  allowMergeCommit,
  isPrOwner,
  isProposalOwner,
  prsNeedsApproval,
}: ProposalActionsProps) {
  const { t } = useTranslation(["common", "pull-request", "proposal"]);

  const { state } = useAppState();

  const isProposalFailedOrMerged = !proposal?.refusedByBountyOwner || !proposal?.isMerged;
  const isProposalDisputable = isDisputableOnChain && isDisputable;

  const warnings = [
    isDisputableOnChain && t("proposal:messages.in-disputable-time", {
      time: missingDisputableTime,
    }),
    (isPrOwner && !isProposalDisputable && !isProposalFailedOrMerged) && t("proposal:messages.owner-pull-request"),
    (isProposalOwner && !isProposalDisputable && !isProposalFailedOrMerged) && t("proposal:messages.owner-proposal"),
    allowMergeCommit === false && t("pull-request:errors.merge-commit"),
    prsNeedsApproval && t("pull-request:errors.approval"),
  ].filter(warning => warning);

  return (
    <ProposalActionsView
      proposal={proposal}
      issue={issue}
      pullRequest={pullRequest}
      distributedAmounts={distributedAmounts}
      percentageNeededForDispute={
        +state.Service?.network?.amounts?.percentageNeededForDispute
      }
      warnings={warnings}
      isUserAbleToDispute={isUserAbleToDispute}
      isDisputable={isDisputable}
      isRefusable={isRefusable}
      isMergeable={isMergeable}
    />
  );
}
