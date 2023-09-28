import React from "react";

import BigNumber from "bignumber.js";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";

import { useAppState } from "contexts/app-state";

import { IssueBigNumberData, Deliverable } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import { useNetwork } from "x-hooks/use-network";

import ItemRowView from "./view";

interface ItemRowProps {
  item: Proposal | Deliverable;
  isProposal: boolean;
  currentBounty: IssueBigNumberData;
}

export default function ItemRow({
  item,
  isProposal,
  currentBounty
}: ItemRowProps) {
  const { state } = useAppState();

  const router = useRouter();
  const { getURLWithNetwork } = useNetwork();

  const pathRedirect = isProposal ? "bounty/[id]/proposal/[proposalId]" : "bounty/[id]/deliverable/[deliverableId]";
  const valueRedirect: {
    id: number | string;
    deliverableId?: number;
    proposalId?: number;
    review?: boolean;
  } = {
    id: currentBounty?.id
  };
  const status = [];

  const proposal = currentBounty?.mergeProposals?.find((proposal) => 
                                                        proposal.contractId === +(item as Proposal)?.contractId);
  const isDisputed = !!proposal?.isDisputed;
  const isMerged = (item as Proposal)?.isMerged;
  const isCanceledDeliverable = !!(item as Deliverable)?.canceled;
  const isDraftDeliverable = !isCanceledDeliverable && !(item as Deliverable)?.markedReadyForReview;
  if (!isProposal) {
    status.push({
      merged: (item as Deliverable)?.accepted,
      isMergeable:
        (item as Deliverable)?.markedReadyForReview &&
        !currentBounty?.deliverables?.find((d) => d.accepted) &&
        !(item as Deliverable)?.canceled,
      isDraft: isDraftDeliverable,
    });
    valueRedirect.deliverableId = (item as Deliverable)?.id;
  } else if (proposal) {
    if (isDisputed || isMerged) {
      status.push({
        label: isDisputed ? "disputed" : "accepted",
      });
    }
    if (proposal.refusedByBountyOwner) status.push({ label: "failed" });

    valueRedirect.proposalId = item?.id;
  }

  const itemId = isProposal
    ? (item as Proposal)?.contractId + 1
    : (item as Deliverable)?.id;

  const totalToBeDisputed = BigNumber(state.Service?.network?.amounts?.percentageNeededForDispute)
    .multipliedBy(state.Service?.network?.amounts?.totalNetworkToken)
    .dividedBy(100);

  const btnLabel = isProposal
    ? "actions.view-proposal"
    : isDraftDeliverable || isCanceledDeliverable
    ? "actions.view-deliverable"
    : "actions.review";

  function handleBtn(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    ev.preventDefault();
    router.push(getURLWithNetwork(pathRedirect, {
      ...valueRedirect,
      ... !isProposal ? { review: (item as Deliverable)?.markedReadyForReview } : {}
    }));
  }

  return (
    <ItemRowView
      key={`${uuidv4()} ${item?.id}`}
      id={itemId}
      item={item}
      href={getURLWithNetwork(pathRedirect, valueRedirect)}
      handleBtn={handleBtn}
      isProposal={isProposal}
      status={status}
      btnLabel={btnLabel}
      proposal={proposal}
      isDisputed={isDisputed}
      isMerged={isMerged}
      totalToBeDisputed={totalToBeDisputed}
    />
  );
}
