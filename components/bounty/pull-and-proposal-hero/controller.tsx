import { nativeZeroAddress } from "@taikai/dappkit/dist/src/utils/constants";
import BigNumber from "bignumber.js";
import { useRouter } from "next/router";

import PullAndProposalHeroView from "components/bounty/pull-and-proposal-hero/view";

import { PullRequest } from "interfaces/issue-data";
import { Proposal } from "interfaces/proposal";

interface PullAndProposalHeroPRops {
  proposal?: Proposal;
  pullRequest?: PullRequest;
}

export default function PullAndProposalHero({
  proposal,
  pullRequest,
}: PullAndProposalHeroPRops) {
  const { back } = useRouter();

  const isProposal = !!proposal;
  const { contractId, githubLogin, createdAt, issue } = proposal || pullRequest || {};
  const creatorAddress = proposal?.creator || pullRequest?.userAddress || nativeZeroAddress;

  return (
    <PullAndProposalHeroView
      contractId={contractId}
      githubLogin={githubLogin}
      createdAt={createdAt}
      creatorAddress={creatorAddress}
      issueTitle={issue?.title}
      issueId={issue?.id}
      isProposal={isProposal}
      issueAmount={BigNumber(issue?.amount)}
      transactionalTokenSymbol={issue?.transactionalToken?.symbol}
      onBackClick={back}
    />
  );
}
