import React from "react";

import BigNumber from "bignumber.js";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";

import { useAppState } from "contexts/app-state";

import { IssueBigNumberData, pullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import { useNetwork } from "x-hooks/use-network";

import ItemRowView from "./view";

interface ItemRowProps {
  item: Proposal | pullRequest;
  isProposal: boolean;
  currentBounty: IssueBigNumberData;
  approvalsRequired: number;
  canUserApprove: boolean;
}

export default function ItemRow({
  item,
  isProposal,
  currentBounty,
  approvalsRequired,
  canUserApprove,
}: ItemRowProps) {
  const { state } = useAppState();

  const router = useRouter();
  const { getURLWithNetwork } = useNetwork();

  const pathRedirect = isProposal ? "/proposal" : "/pull-request";
  const valueRedirect = {
    id: currentBounty?.githubId,
    repoId: currentBounty?.repository_id,
    prId: undefined,
    proposalId: undefined,
  };
  const status = [];

  const proposal = currentBounty?.mergeProposals?.find((proposal) => proposal.contractId === +item?.contractId);
  const isDisputed = !!proposal?.isDisputed;
  const isMerged = (item as Proposal)?.isMerged;

  if (!isProposal) {
    status.push({
      merged: (item as pullRequest)?.merged,
      isMergeable: (item as pullRequest)?.isMergeable,
      isDraft: (item as pullRequest)?.status === "draft",
    });
    valueRedirect.prId = (item as pullRequest)?.githubId;
  } else if (proposal) {
    if (isDisputed || isMerged) {
      status.push({
        label: isDisputed ? "disputed" : "accepted",
      });
    }
    if (proposal.refusedByBountyOwner) status.push({ label: "failed" });

    valueRedirect.proposalId = item?.id;
  }

  const approvalsCurrentPr = (item as pullRequest)?.approvals?.total || 0;
  const shouldRenderApproveButton =
    approvalsCurrentPr < approvalsRequired && canUserApprove && !isProposal;
  const itemId = isProposal
    ? item?.contractId + 1
    : (item as pullRequest)?.githubId;
  const totalToBeDisputed = BigNumber(state.Service?.network?.amounts?.percentageNeededForDispute)
    .multipliedBy(state.Service?.network?.amounts?.totalNetworkToken)
    .dividedBy(100);
  const btnLabel = isProposal
    ? "actions.view-proposal"
    : (item as pullRequest)?.status === "draft"
    ? "actions.view-pull-request"
    : "actions.review";

  function handleBtn(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    ev.preventDefault();
    router.push?.(getURLWithNetwork(pathRedirect, {
        ...valueRedirect,
        review: (item as pullRequest)?.status === "ready",
    }));
  }

  return (
    <ItemRowView
      key={`${uuidv4()} ${item?.id}`}
      id={itemId}
      item={item}
      href={getURLWithNetwork(pathRedirect, valueRedirect)}
      handleBtn={handleBtn}
      githubPath={state.Service?.network?.repos?.active?.githubPath}
      isProposal={isProposal}
      status={status}
      btnLabel={btnLabel}
      shouldRenderApproveButton={shouldRenderApproveButton}
      proposal={proposal}
      isDisputed={isDisputed}
      isMerged={isMerged}
      totalToBeDisputed={totalToBeDisputed}
    />
  );
}
