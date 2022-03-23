import { useContext } from "react";

import Link from "next/link";

import LockedIcon from "assets/icons/locked-icon";

import PercentageProgressBar from "components/percentage-progress-bar";
import ProposalProgressSmall from "components/proposal-progress-small";

import { ApplicationContext } from "contexts/application";
import { useIssue } from "contexts/issue";

import { IssueData } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

import useBepro from "x-hooks/use-bepro";
import useNetworkTheme from "x-hooks/use-network";

import Button from "./button";
import ReadOnlyButtonWrapper from "./read-only-button-wrapper";
import Translation from "./translation";

interface Options {
  proposal: Proposal;
  issue: IssueData;
  isFinalized: boolean;
  isDisputable?: boolean;
}

export default function ProposalItem({
  proposal,
  issue,
  isFinalized,
  isDisputable = false
}: Options) {
  const {
    state: { beproStaked }
  } = useContext(ApplicationContext);
  const { networkIssue, getNetworkIssue } = useIssue();
  const { handlerDisputeProposal } = useBepro();
  const { getURLWithNetwork } = useNetworkTheme();
  const networkProposals = networkIssue?.networkProposals?.[proposal?.id];

  async function handleDispute() {
    if (!isDisputable || isFinalized) return;
    handlerDisputeProposal(+proposal.scMergeId).then(() =>
      getNetworkIssue());
  }

  function getColors() {
    if (isFinalized && !networkProposals?.isDisputed && proposal.isMerged) {
      return "success";
    }

    if (networkProposals?.isDisputed || (isFinalized && !proposal.isMerged)) {
      return "danger";
    }

    return "purple";
  }

  function getLabel() {
    let action = "dispute";

    if (isFinalized && !networkProposals?.isDisputed && proposal.isMerged) {
      action = "accepted";
    }

    if (networkProposals?.isDisputed || (isFinalized && !proposal.isMerged)) {
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
            className={`col-3 caption-small mt-2 text-uppercase text-${
              getColors() === "purple" ? "white" : getColors()
            }`}
          >
            <Translation ns="pull-request" label={"abbreviation"} /> #
            {proposal?.githubLogin} <Translation label={"misc.by"} />{" "}
            {proposal?.githubLogin && ` @${proposal?.githubLogin}`}
          </div>
          <div className="col-5 d-flex justify-content-between mb-2 text-white">
            {networkProposals?.prAmounts &&
              networkProposals?.prAmounts?.map((value, i) => (
                <PercentageProgressBar
                  key={`pg-${i}`}
                  textClass={`caption-small p-small text-${getColors()}`}
                  pgClass={`bg-${getColors()}`}
                  className={
                    (i + 1 < networkProposals?.prAmounts?.length && "me-2") ||
                    ""
                  }
                  value={value}
                  total={issue.amount}
                />
              ))}
          </div>

          <div className="col-4 d-flex">
            <div className="col-9 offset-1 text-white">
              <ProposalProgressSmall
                pgClass={`${getColors()}`}
                value={+networkProposals?.disputes}
                total={beproStaked}
                textClass={`pb-2 text-${getColors()}`}
              />
            </div>

            <div className="col-1 offset-1 justify-content-end d-flex">
              <ReadOnlyButtonWrapper>
                <Button
                  color={getColors()}
                  disabled={!isDisputable || !networkProposals}
                  outline={!isDisputable}
                  className={"align-self-center mb-2 ms-3 read-only-button"}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    handleDispute();
                  }}
                >
                  {!isDisputable && getColors() !== "success" && (
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
