import { Bounty, Proposal, PullRequest } from "@taikai/dappkit";

export function bountyParser(bounty) : Bounty {
  const parsed = {
    id: bounty?.id,
    creationDate: +bounty?.creationDate * 1000,
    tokenAmount: +bounty?.tokenAmount,
    creator: bounty?.creator,
    transactional: bounty?.transactional,
    rewardToken: bounty?.rewardToken,
    rewardAmount: +bounty?.rewardAmount,
    fundingAmount: +bounty?.fundingAmount,
    closed: bounty?.closed,
    canceled: bounty?.canceled,
    funded: bounty?.funded,
    title: bounty?.title,
    repoPath: bounty?.repoPath,
    branch: bounty?.branch,
    cid: bounty?.cid,
    closedDate: +bounty?.closedDate * 1000,
    pullRequests: bounty?.pullRequests.map(pullRequestParser),
    proposals: bounty?.proposals.map(proposalParser),
    funding: bounty?.funding,
    githubUser: bounty?.githubUser
  };

  return parsed;
}

export function pullRequestParser(pullRequest): PullRequest {
  const parsed = {
    originRepo: pullRequest.originRepo,
    originCID: pullRequest.originCID,
    originBranch: pullRequest.originBranch,
    userRepo: pullRequest.userRepo,
    userBranch: pullRequest.userBranch,
    ready: pullRequest.ready,
    canceled: pullRequest.canceled,
    creator: pullRequest.creator,
    cid: pullRequest.cid,
    id: pullRequest.id
  };

  return parsed;
}

export function proposalParser(proposal): Proposal {
  const parsed = {
    id: +proposal.id,
    creationDate: +proposal.creationDate * 1000,
    oracles: +proposal.oracles,
    disputeWeight: +proposal.disputeWeight,
    prId: +proposal.prId,
    refusedByBountyOwner: proposal.refusedByBountyOwner,
    creator: proposal.creator,
    details: proposal.details
  };

  return parsed;
}