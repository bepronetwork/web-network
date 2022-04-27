
import Link from "next/link";

import LockedIcon from "assets/icons/locked-icon";

import PercentageProgressBar from "components/percentage-progress-bar";
import ProposalProgressSmall from "components/proposal-progress-small";

import { useAuthentication } from "contexts/authentication";
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";

import { isProposalDisputable } from "helpers/proposal";

import { isProposalDisputable } from "helpers/proposal";

import { IssueData } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useNetworkTheme from "x-hooks/use-network";

import Button from "./button";
import ReadOnlyButtonWrapper from "./read-only-button-wrapper";
import Translation from "./translation";

interface Options {
  proposal: Proposal;
  issue: IssueData;
  disputableTime?: number;
  isDisputable: boolean;
}

export default function ProposalItem({
  proposal,
  issue,
  disputableTime,
  isDisputable
}: Options) {

  const { wallet } = useAuthentication()
  const { networkIssue, getNetworkIssue } = useIssue();
  const { handlerDisputeProposal } = useBepro();
  const { getURLWithNetwork } = useNetworkTheme();
  const { activeNetwork } = useNetwork();
  const { pastEventsV2 } = useApi();
  
  const networkProposals = networkIssue?.proposals?.[proposal?.contractId];
  const networkPullRequest = networkIssue?.pullRequests?.[networkProposals?.prId];

  const isDisable = () => [
      networkIssue?.closed,
      networkProposals?.refusedByBountyOwner,
      !isProposalDisputable(proposal?.createdAt, disputableTime),
      networkIssue?.proposals[proposal.contractId]?.isDisputed,
      !networkIssue?.proposals[proposal.contractId]?.canUserDispute,
      wallet?.balance?.oracles?.locked === 0,
  ]
    .some(v => v);

  const isDisable = [
      networkIssue?.finalized,
      !isProposalDisputable(proposal?.createdAt, disputableTime),
      networkIssue?.networkProposals[proposal.id]?.isDisputed,
      !networkIssue?.networkProposals[proposal.id]?.canUserDispute,
      wallet?.balance?.oracles?.tokensLocked === 0,
  ]
    .some(v => v)

  async function handleDispute() {
    if (!isDisputable || networkIssue?.closed) return;
    handlerDisputeProposal(+proposal.scMergeId)
    .then(txInfo => {
      const { blockNumber: fromBlock } = txInfo as any;

      return pastEventsV2("proposal", "disputed", activeNetwork?.name, { fromBlock });
    })
    .then(() =>
      getNetworkIssue());
  }

  function getColors() {
    if (networkIssue?.closed && !networkProposals?.isDisputed && proposal.isMerged) {
      return "success";
    }

    if (networkProposals?.isDisputed || 
        networkProposals?.refusedByBountyOwner || 
        (networkIssue?.closed && !proposal.isMerged)) {
      return "danger";
    }

    return "purple";
  }

  function getLabel() {
    let action = "dispute";

    if (networkIssue?.closed && !networkProposals?.isDisputed && proposal.isMerged) {
      action = "accepted";
    }

    if (networkProposals?.isDisputed || 
        networkProposals?.refusedByBountyOwner || 
        (networkIssue?.closed && !proposal.isMerged)) {
      action = "failed";
    }

    return <Translation label={`actions.${action}`} />;
  }

  return (
    <Link
      passHref
      key={`${proposal?.pullRequestId}${proposal?.scMergeId}`}
      href={getURLWithNetwork("/proposal", {
        id: issue.githubId,
        repoId: issue.repository_id,
        proposalId: proposal?.id
      })}
    >
      <div className="content-list-item proposal cursor-pointer">
        <div className="rounded row align-items-center">
          <div
            className={`col-3 caption-small mt-2 text-uppercase text-${getColors() === "purple" ? "white" : getColors()
              }`}
          >
            <Translation ns="pull-request" label={"abbreviation"} /> #
            {networkPullRequest?.cid} <Translation label={"misc.by"} />{" "}
            {proposal?.githubLogin && ` @${proposal?.githubLogin}`}
          </div>
          <div className="col-5 d-flex justify-content-between mb-2 text-white">
            {networkProposals?.details &&
              networkProposals?.details?.map((detail, i) => (
                <PercentageProgressBar
                  key={`pg-${i}`}
                  textClass={`caption-small p-small text-${getColors()}`}
                  pgClass={`bg-${getColors()}`}
                  className={
                    (i + 1 < networkProposals?.details?.length && "me-2") ||
                    ""
                  }
                  value={detail.percentage}
                />
              ))}
          </div>

          <div className="col-4 d-flex">
            <div className="col-9 offset-1 text-white">
              <ProposalProgressSmall
                pgClass={`${getColors()}`}
                value={+networkProposals?.disputeWeight}
                total={wallet?.balance?.staked}
                textClass={`pb-2 text-${getColors()}`}
              />
            </div>

            <div className="col-1 offset-1 justify-content-end d-flex">
              <ReadOnlyButtonWrapper>
                <Button
                  color={getColors()}
                  disabled={isDisable() || !networkProposals}
                  outline={isDisable()}
                  className={"align-self-center mb-2 ms-3 read-only-button"}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleDispute();
                  }}
                >
                  {isDisable() && getColors() !== "success" && (
                    <LockedIcon className={`me-2 text-${getColors()}`} />
                  )}
                  <span>{getLabel()}</span>
                </Button>
              </ReadOnlyButtonWrapper>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
