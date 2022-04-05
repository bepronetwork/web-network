import { Bounty } from "@taikai/dappkit";

export function bountyParser(bounty: any) : Bounty {
  const parsed = {
    id: bounty?.id,
    creationDate: +bounty?.creationDate * 1000,
    tokenAmount: bounty?.tokenAmount,
    creator: bounty?.creator,
    transactional: bounty?.transactional,
    rewardToken: bounty?.rewardToken,
    rewardAmount: bounty?.rewardAmount,
    fundingAmount: bounty?.fundingAmount,
    closed: bounty?.closed,
    canceled: bounty?.canceled,
    funded: bounty?.funded,
    title: bounty?.title,
    repoPath: bounty?.repoPath,
    branch: bounty?.branch,
    cid: bounty?.cid,
    closedDate: +bounty?.closedDate * 1000,
    pullRequests: bounty?.pullRequests,
    proposals: bounty?.proposals,
    funding: bounty?.funding,
    githubUser: bounty?.githubUser
  };

  return parsed;
}