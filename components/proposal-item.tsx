
import React, { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import Link from "next/link";

import LockedIcon from "assets/icons/locked-icon";

import PercentageProgressBar from "components/percentage-progress-bar";
import ProposalProgressSmall from "components/proposal-progress-small";

import { useAuthentication } from "contexts/authentication";
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";

import { isProposalDisputable } from "helpers/proposal";

import { Proposal } from "interfaces/proposal";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useNetworkTheme from "x-hooks/use-network";

import Button from "./button";
import ReadOnlyButtonWrapper from "./read-only-button-wrapper";
import Translation from "./translation";

interface ProposalItemProps {
  proposal: Proposal;
}

interface ProposalState {
  label: string;
  textColor: string;
  contextColor: string;
}

const DEFAULT_PROPOSAL_STATE: ProposalState = {
  label: "dispute",
  textColor: "white",
  contextColor: "purple"
};

export default function ProposalItem({
  proposal
}: ProposalItemProps) {
  const { t } = useTranslation("common");
  const [ proposalState, setProposalState ] = useState<ProposalState>(DEFAULT_PROPOSAL_STATE);

  const { processEvent } = useApi();
  const { wallet } = useAuthentication();
  const { activeNetwork } = useNetwork();
  const { handlerDisputeProposal } = useBepro();
  const { getURLWithNetwork } = useNetworkTheme();
  const { activeIssue, networkIssue, getNetworkIssue } = useIssue();
  
  const networkProposal = networkIssue?.proposals?.[proposal?.contractId];
  const networkPullRequest = networkIssue?.pullRequests?.find(pr => pr.id === networkProposal?.prId);

  const isProposalMerged = proposal.isMerged;
  const isBountyClosed = !!networkIssue?.closed;
  const isProposalDisputed = !!networkProposal?.isDisputed;
  const isDisputableByUser = !!networkProposal?.canUserDispute;
  const isProposalRefused = networkProposal?.refusedByBountyOwner;

  const isDisputable = 
    isProposalDisputable(proposal?.createdAt, activeNetwork?.disputableTime) && !isProposalDisputed;

  const isDisable = () => [
      isBountyClosed,
      isProposalRefused,
      !isDisputable,
      isProposalDisputed,
      !isDisputableByUser,
      wallet?.balance?.oracles?.locked === 0,
  ].some(v => v);

  async function handleDispute(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();

    if (!isDisputable || isBountyClosed) return;

    handlerDisputeProposal(+proposal.scMergeId)
      .then(txInfo => {
        const { blockNumber: fromBlock } = txInfo as { blockNumber: number };

        return processEvent("proposal", "disputed", activeNetwork?.name, { fromBlock });
      })
      .then(() => getNetworkIssue());
  }

  useEffect(() => {
    if (isBountyClosed && !isProposalDisputed && isProposalMerged) 
      setProposalState({
        label: "accepted",
        textColor: "success",
        contextColor: "success"
      });
    else if (isProposalDisputed || isProposalRefused || (isBountyClosed && !isProposalMerged))
      setProposalState({
        label: "failed",
        textColor: "danger",
        contextColor: "danger"
      });
    else
      setProposalState(DEFAULT_PROPOSAL_STATE);

  }, [isBountyClosed, isProposalDisputed, isProposalMerged, isProposalRefused]);

  return (
    <Link
      passHref
      key={`${proposal?.pullRequestId}${proposal?.scMergeId}`}
      href={getURLWithNetwork("/proposal", {
        id: activeIssue?.githubId,
        repoId: activeIssue?.repository_id,
        proposalId: proposal?.id
      })}
    >
      <div className="content-list-item proposal cursor-pointer">
        <div className="rounded row align-items-center">
          <div
            className={`col-3 caption-small mt-2 text-uppercase text-${proposalState.textColor}`}
          >
            <Translation ns="pull-request" label={"abbreviation"} /> #
            {networkPullRequest?.cid} <Translation label={"misc.by"} />{" "}
            {proposal?.githubLogin && ` @${proposal?.githubLogin}`}
          </div>
          <div className="col-5 d-flex justify-content-between mb-2 text-white">
            {networkProposal?.details &&
              networkProposal?.details?.map((detail, i) => (
                <PercentageProgressBar
                  key={`pg-${i}`}
                  textClass={`caption-small p-small text-${proposalState.contextColor}`}
                  pgClass={`bg-${proposalState.contextColor}`}
                  className={
                    (i + 1 < networkProposal?.details?.length && "me-2") ||
                    ""
                  }
                  value={detail.percentage}
                />
              ))}
          </div>

          <div className="col-4 d-flex">
            <div className="col-9 offset-1 text-white">
              <ProposalProgressSmall
                pgClass={`${proposalState.contextColor}`}
                value={+networkProposal?.disputeWeight}
                total={wallet?.balance?.staked}
                textClass={`pb-2 text-${proposalState.contextColor}`}
              />
            </div>

            <div className="col-1 offset-1 justify-content-end d-flex">
              <ReadOnlyButtonWrapper>
                <Button
                  color={proposalState.contextColor}
                  disabled={isDisable() || !networkProposal}
                  outline={isDisable()}
                  className={"align-self-center mb-2 ms-3 read-only-button"}
                  onClick={handleDispute}
                >
                  {isDisable() && proposalState.contextColor !== "success" && (
                    <LockedIcon className={`me-2 text-${proposalState.contextColor}`} />
                  )}
                  <span>{t(`actions.${proposalState.label}`)}</span>
                </Button>
              </ReadOnlyButtonWrapper>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
