import React from "react";

import BigNumber from "bignumber.js";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";

import { useAppState } from "contexts/app-state";

import { IssueBigNumberData, PullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import { useNetwork } from "x-hooks/use-network";

import ItemRowView from "./view";

interface ItemRowProps {
  item: Proposal | PullRequest;
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

  const pathRedirect = isProposal ? "/proposal/[id]" : "/pull-request";
  const valueRedirect = {
    id: isProposal ? item?.id : currentBounty?.id,
    prId: undefined,
    proposalId: undefined,
  };
  const status = [];

  const proposal = currentBounty?.mergeProposals?.find((proposal) => proposal.contractId === +item?.contractId);
  const isDisputed = !!proposal?.isDisputed;
  const isMerged = (item as Proposal)?.isMerged;

  if (!isProposal) {
    status.push({
      merged: (item as PullRequest)?.merged,
      isMergeable: (item as PullRequest)?.isMergeable,
      isDraft: (item as PullRequest)?.status === "draft",
    });
    valueRedirect.prId = (item as PullRequest)?.githubId;
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
    ? item?.contractId + 1
    : (item as PullRequest)?.githubId;

  const totalToBeDisputed = BigNumber(state.Service?.network?.amounts?.percentageNeededForDispute)
    .multipliedBy(state.Service?.network?.amounts?.totalNetworkToken)
    .dividedBy(100);

  const btnLabel = isProposal
    ? "actions.view-proposal"
    : (item as PullRequest)?.status === "draft"
    ? "actions.view-pull-request"
    : "actions.review";

  function handleBtn(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    ev.preventDefault();
    router.push?.(getURLWithNetwork(pathRedirect, {
        ...valueRedirect,
        review: (item as PullRequest)?.status === "ready",
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
